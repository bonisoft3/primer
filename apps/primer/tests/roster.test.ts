// The roster, the addresses, and the two properties a figure column owes a
// reader: a fixed advance and no motion.
//
// Everything here settles COLD — off the seed, with no live service and before
// any control is touched — because a roster whose numbers arrive after a gesture
// is a roster that cannot be read.

import { assert, writes } from "../../../plugins/omnishell/test/screen-harness.ts";
import * as G from "./ground-truth.ts";
import { cells, open, textOf, txt } from "./drive.ts";

Deno.test("the roster lands on the fourteen, cold, with nothing to sign in to", async () => {
  const m = await open({ screen: "roster" });
  const rows = m.all("li.theme-row");
  assert(rows.length === G.THEMES.length, `${rows.length} theme rows for ${G.THEMES.length} themes`);
  for (const [i, li] of rows.entries()) {
    // Grouped by ground and in the roster's own order, which is the tarball's
    // listing ordered ground then reader then contrast.
    const [reader, contrast] = cells(li, ["reader", "contrast"]);
    const name = textOf([...li.querySelectorAll(".theme-name")][0]);
    assert(name === G.THEMES[i], `row ${i} names ${name}, the roster's order says ${G.THEMES[i]}`);
    assert(reader === G.readerOf(name), `${name}: the row says its reader is ${reader}`);
    assert(contrast === G.contrastOf(name), `${name}: the row says its contrast is ${contrast}`);
    // The score is there before any gesture: settle() drove the fold and nothing
    // else, and a blank figure here is a roster that has to be poked to answer.
    for (const c of ["holds", "fails", "improved", "regressed", "unchanged"]) {
      assert(cells(li, [c])[0] !== "", `${name}: the ${c} figure is blank on a cold mount`);
    }
  }
  // Nothing to sign in to: the app declares no auth, so no login chrome exists to
  // stand between a reader and the fourteen.
  assert(m.all("[data-login]").length === 0, "the roster carries login chrome");
  await m.stop();
});

Deno.test("the four unpublished cells are rows, and all four name one ground", async () => {
  const m = await open({ screen: "roster" });
  const rows = m.all("li.cell");
  const cross = G.GROUNDS.length * 3 * G.CONTRASTS.length;
  assert(rows.length === cross, `${rows.length} cells shown, ${cross} in the cross`);
  const missing = rows.filter((li) => textOf([...li.querySelectorAll(".cell-state")][0]) === "false");
  assert(missing.length === 4, `${missing.length} cells say they are unpublished, not four`);
  for (const li of missing) {
    assert(textOf(li).includes("dark-dimmed"), `an unpublished cell is not on the dimmed ground: ${textOf(li)}`);
    assert(textOf([...li.querySelectorAll(".cell-theme")][0]) === "", "an unpublished cell names a theme");
  }
  await m.stop();
});

Deno.test("the pair this app wears is marked, and it is the pair its own audit recommends", async () => {
  const m = await open({ screen: "roster" });
  const worn = m.all("li.theme-row").filter((li) => textOf([...li.querySelectorAll(".wears")][0]) !== "");
  assert(worn.length === 2, `${worn.length} rows are marked as worn, not two`);
  const names = worn.map((li) => textOf([...li.querySelectorAll(".theme-name")][0]));
  const halves = worn.map((li) => textOf([...li.querySelectorAll(".wears")][0]));
  assert(halves.sort().join() === "dark,light", `the worn halves are ${halves.join(", ")}`);
  // The recommendation is the AUDIT'S, on the audit's own criterion: fewest
  // readings below the floor across the three simulations, summed over the two
  // grounds a pronto identity pairs. The app follows its own number rather than
  // the family name, which is what makes the adoption a measurement.
  const truth = G.readings();
  const below = (theme: string) =>
    truth.filter((r) => r.theme === theme && r.reader !== "trichromat" && r.verdict === "fails").length;
  const pairs = G.THEMES.filter((t) => G.groundOf(t) === "light").flatMap((l) => {
    const d = G.twinOf(l);
    return d === undefined ? [] : [{ light: l, dark: d, cost: below(l) + below(d) }];
  });
  assert(pairs.length === 6, `${pairs.length} twinnable pairs, not six`);
  const best = pairs.slice().sort((a, b) => a.cost - b.cost)[0];
  const runnerUp = pairs.slice().sort((a, b) => a.cost - b.cost)[1];
  // And it has to be a strict winner, or "the pair its audit recommends" would be
  // one of several and the sentence on the screen would be a preference.
  assert(best.cost < runnerUp.cost, `${best.light} ties ${runnerUp.light} at ${best.cost}, so the recommendation is a choice`);
  assert(
    names.sort().join() === [best.dark, best.light].sort().join(),
    `the audit recommends ${best.light} / ${best.dark} at ${best.cost} and the app wears ${names.join(", ")}`,
  );
  await m.stop();
});

Deno.test("each theme has its own address and two addresses never paint the same specimens", async () => {
  const seen = new Map<string, string>();
  for (const theme of G.THEMES) {
    const m = await open({ screen: "theme", params: { theme } });
    const heading = textOf(m.all("h1")[0]);
    assert(heading === theme, `/theme/${theme} is headed ${heading}`);
    const paint = m.all("li.op .pair").map((el) => txt(el.getAttribute("style"))).join("|");
    assert(paint !== "", `${theme}: nothing is painted`);
    for (const [other, before] of seen) {
      assert(before !== paint, `${theme} paints exactly what ${other} paints`);
    }
    seen.set(theme, paint);
    await m.stop();
  }
  assert(seen.size === G.THEMES.length, `${seen.size} distinct addresses`);
});

Deno.test("one opposition opens on its own screen with every theme in a column", async () => {
  const graded = G.oppositions().filter((o) => o.graded === "true");
  const o = graded[0];
  const m = await open({ screen: "opposition", params: { opposition: o.id } });
  const rows = m.all("li.cell-reading");
  assert(
    rows.length === G.THEMES.length * G.READERS.length,
    `${rows.length} readings in the column for ${G.THEMES.length} themes × ${G.READERS.length} readings`,
  );
  const themes = rows.map((li) => cells(li, ["theme-name"])[0]);
  assert(new Set(themes).size === G.THEMES.length, `${new Set(themes).size} themes in the column`);
  // Ordered by theme, so a variant that improves one reader while regressing
  // another is a shape in the column rather than a claim in a sentence.
  assert(themes.join() === themes.slice().sort().join(), "the column is not ordered by theme");
  await m.stop();
});

Deno.test("changing the reader is answered without a network request", async () => {
  const m = await open({ screen: "theme", params: { theme: "light" } });
  const before = m.store.calls.length;
  const forms = m.all(".readers form");
  m.fire(forms[3], "submit");
  await m.settle();
  const after = m.store.calls.slice(before);
  // Every entity is at `tab`, so there is no service to reach: the only contacts
  // a gesture makes are with the terminal's own collections.
  assert(after.length > 0, "the reader moved and the store saw nothing");
  const tables = new Set(after.map((c) => c.table));
  for (const t of tables) {
    assert(
      ["cursor", "reading"].includes(t),
      `a reader gesture touched ${t}, which is neither the cursor nor the readings it repaints`,
    );
  }
  await m.stop();
});

Deno.test("no figure animates and every figure is set in a fixed advance", () => {
  const css = [
    "shell/shared/sheet.css",
    ...["roster", "theme", "opposition", "pairings", "tokens", "spec"].map((s) => `shell/screens/${s}.css`),
  ].map((rel) => ({ rel, text: Deno.readTextFileSync(new URL(rel, G.APP)) }));
  const all = css.map((c) => c.text).join("\n");
  // Two readings of the same separation have to look the same, so nothing moves.
  for (const { rel, text } of css) {
    for (const prop of ["animation-name", "@keyframes"]) {
      assert(!text.includes(prop), `${rel} declares ${prop}`);
    }
    const transitions = [...text.matchAll(/transition\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
    for (const t of transitions) {
      assert(t === "none", `${rel} declares transition: ${t}`);
    }
  }
  // A column of separations is read by the shape of the column, and there is no
  // rung for a font feature — nor a vocabulary that contains one.
  assert(all.includes("font-variant-numeric: tabular-nums"), "no stylesheet sets a fixed advance for figures");
});

Deno.test("the mount makes no write the reader did not ask for", async () => {
  const m = await open({ screen: "roster" });
  const seeded = ["token", "theme", "cell", "segment", "reader", "floor", "opposition", "pairing", "claim", "type_rung"];
  const bad = writes(m).filter((c) => seeded.includes(c.table));
  assert(bad.length === 0, `a cold mount wrote to ${bad.map((c) => c.table).join(", ")}`);
  // The derived collections ARE written — that is the fold doing its job — and
  // nothing else is.
  const touched = new Set(writes(m).map((c) => c.table));
  for (const t of touched) {
    assert(
      ["reading", "ratio", "score", "census"].includes(t),
      `a cold mount wrote to ${t}, which no fold on the roster owns`,
    );
  }
  await m.stop();
});
