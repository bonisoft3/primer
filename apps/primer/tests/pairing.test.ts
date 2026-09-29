// Primer's published pairing matrix, graded off the rendered sheet.
//
// The ratio is the one arithmetic in this app that is a CALL rather than a
// reimplementation: `contrast()` is exported from the vendored validator, so the
// oracle uses it and the app writes its own — the same two-route shape as the
// separation, with the vendor's own function standing on one side of it.

import { assert } from "../../../plugins/omnishell/test/screen-harness.ts";
import * as G from "./ground-truth.ts";
import { cells, open, textOf } from "./drive.ts";

const truth = await G.ratios();
const byId = new Map(truth.map((r) => [r.id, r]));
const pairings = G.pairings();

Deno.test("every ratio the sheet prints equals the independent route's", async () => {
  let compared = 0;
  const disagreements: string[] = [];
  for (const theme of G.THEMES) {
    const m = await open({ screen: "pairings", params: { theme } });
    const rows = m.all("li.ratio-row");
    assert(
      rows.length === pairings.length,
      `${theme}: the sheet draws ${rows.length} rows for ${pairings.length} obligations`,
    );
    for (const li of rows) {
      const [pairing, ratio, vText, vUi] = cells(li, ["pairing-id", "ratio", "v-text", "v-ui"]);
      const want = byId.get(`${pairing}#${theme}`);
      assert(want !== undefined, `${theme} / ${pairing}: the ground truth answers no such obligation`);
      if (ratio !== String(want.ratio)) {
        disagreements.push(`${theme} / ${pairing}: ratio printed ${ratio}, owed ${want.ratio}`);
      }
      if (vText !== want.verdict_text) {
        disagreements.push(`${theme} / ${pairing}: the 4.5:1 verdict printed ${vText}, owed ${want.verdict_text}`);
      }
      if (vUi !== want.verdict_ui) {
        disagreements.push(`${theme} / ${pairing}: the 3:1 verdict printed ${vUi}, owed ${want.verdict_ui}`);
      }
      // Both verdicts on every row, always. Dropping one for tidiness is exactly
      // what turns a measurement into an opinion, so its absence is a failure and
      // not a formatting choice.
      assert(vText !== "" && vUi !== "", `${theme} / ${pairing}: a row carries only one verdict`);
      compared++;
    }
    // The ground the drawn text sits on has to be painted from the row: a row
    // drawn in the chrome's own colours would be showing the wrong ratio.
    for (const el of m.all(".drawn-text")) {
      const style = String(el.getAttribute("style"));
      assert(
        style.includes("--ground") && style.includes("--ink"),
        `${theme}: a pairing row is drawn from nothing — ${style}`,
      );
    }
    await m.stop();
  }
  assert(compared === truth.length, `${compared} ratios read off the sheets, ${truth.length} answered`);
  assert(disagreements.length === 0, `${disagreements.length} disagreements:\n  ${disagreements.slice(0, 12).join("\n  ")}`);
});

Deno.test("the roster is the vendor's matrix and every obligation is satisfiable", () => {
  const semantics = G.semantics();
  assert(semantics.length > 0, "the declarations name no emphasis semantic, so this case grades nothing");
  // Two rows per semantic plus the two default-ground rows the matrix names. If a
  // semantic had an emphasis ground and no muted one, or a muted ground and no
  // semantic ink, pairings() would have raised — an unsatisfiable obligation is an
  // error rather than a row that always misses.
  assert(
    pairings.length === semantics.length * 2 + 2,
    `${pairings.length} obligations for ${semantics.length} semantics`,
  );
  const ambiguous = pairings.filter((p) => p.ambiguous === "true");
  assert(
    ambiguous.length === semantics.length,
    `${ambiguous.length} obligations are threshold-ambiguous, and every muted ground is one`,
  );
  for (const p of ambiguous) {
    assert(p.ground_token.endsWith("-muted"), `${p.id} is ambiguous and is not a muted ground`);
  }
});

Deno.test("the dimmed ground misses the higher published ratio on every muted pairing it has", async () => {
  const muted = pairings.filter((p) => p.ambiguous === "true").map((p) => p.id);
  const m = await open({ screen: "pairings", params: { theme: "dark-dimmed" } });
  const rows = m.all("li.ratio-row");
  const named: string[] = [];
  for (const li of rows) {
    const [pairing, , vText, vUi] = cells(li, ["pairing-id", "ratio", "v-text", "v-ui"]);
    if (!muted.includes(pairing)) continue;
    // Each miss named individually, and each clearing the lower threshold. If the
    // app quietly picked one threshold, one of these two words would be missing
    // and this case would go red rather than reading as a pass.
    assert(vText === "misses", `dark-dimmed / ${pairing}: the 4.5:1 verdict is ${vText}`);
    assert(vUi === "holds", `dark-dimmed / ${pairing}: the 3:1 verdict is ${vUi}`);
    assert(
      textOf([...li.querySelectorAll(".filed")][0]) === "true",
      `dark-dimmed / ${pairing}: the row does not say the threshold is ambiguous`,
    );
    named.push(pairing);
  }
  assert(
    named.length === muted.length,
    `${named.length} of the dimmed ground's ${muted.length} muted pairings miss 4.5:1`,
  );
  await m.stop();
});

Deno.test("the dimmed ground is the only theme that misses, so the departure is its own", () => {
  const missing = new Map<string, number>();
  for (const r of truth) {
    if (r.verdict_text === "misses") missing.set(r.theme, (missing.get(r.theme) ?? 0) + 1);
  }
  // A departure every theme shared would be a departure of the method rather than
  // of the theme, and this app would be grading its own compositing choice.
  assert(
    [...missing.keys()].join() === "dark-dimmed",
    `${[...missing.keys()].join(", ")} miss the higher threshold`,
  );
  assert(
    truth.every((r) => r.verdict_ui === "holds"),
    `${truth.filter((r) => r.verdict_ui === "misses").length} obligations miss even 3:1`,
  );
});

Deno.test("the published thresholds are on the sheet as rows with their provenance", async () => {
  const m = await open({ screen: "pairings", params: { theme: "light" } });
  const rows = m.all(".thresholds li");
  const owed = G.FLOORS.filter((f) => f.applies === "ratio");
  assert(rows.length === owed.length, `${rows.length} thresholds on the sheet, ${owed.length} published`);
  for (const [i, li] of rows.entries()) {
    const text = textOf(li);
    assert(text.includes(String(owed[i].value)), `the threshold row does not print ${owed[i].value}`);
    assert(textOf([...li.querySelectorAll(".src")][0]) !== "", "a threshold row carries no provenance");
  }
  await m.stop();
});
