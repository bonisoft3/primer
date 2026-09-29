// The spine's first half: every separation the app PRINTS against the number the
// independent route computes from the vendored bytes, and then the verdict
// distribution — which is what stops the suite being satisfiable by a constant.
//
// What this file cannot see: it mounts into linkedom, which computes no style, so
// it cannot tell a painted specimen from an empty box. That is `paint`'s job, and
// the separation grade is not finished until `paint` has run it over the rendered
// page.

import { assert } from "../../../plugins/omnishell/test/screen-harness.ts";
import * as G from "./ground-truth.ts";
import { cells, open, pickReader, shownReadings, textOf, txt } from "./drive.ts";

const truth = G.readings();
const byId = new Map(truth.map((r) => [r.id, r]));
const graded = G.oppositions().filter((o) => o.graded === "true");

Deno.test("every separation the audit prints equals the independent route's", async () => {
  let compared = 0;
  const disagreements: string[] = [];
  for (const theme of G.THEMES) {
    const m = await open({ screen: "theme", params: { theme } });
    // The screen has to show every graded opposition; a screen showing eighteen
    // of nineteen is exactly the silent cut this comparison would otherwise miss.
    const blocks = m.all("li.op");
    assert(
      blocks.length === graded.length,
      `${theme}: the audit draws ${blocks.length} opposition blocks for ${graded.length} graded pairs`,
    );
    for (const block of blocks) {
      const name = textOf([...block.querySelectorAll("h2 a")][0]);
      const rows = [...block.querySelectorAll("li.reading")];
      assert(
        rows.length === G.READERS.length,
        `${theme} / ${name}: ${rows.length} readings shown, not ${G.READERS.length}`,
      );
      for (const li of rows) {
        const [reader, sep, floor, verdict, delta] = cells(li, ["who", "sep", "floor", "verdict", "delta"]);
        const want = byId.get(`${name}#${theme}#${reader}`);
        assert(want !== undefined, `${theme} / ${name} / ${reader}: the ground truth answers no such reading`);
        const shown = { sep, floor, verdict, delta };
        const owed = {
          sep: String(want.separation),
          floor: String(want.floor),
          verdict: want.verdict,
          delta: String(want.delta),
        };
        for (const k of ["sep", "floor", "verdict", "delta"] as const) {
          if (shown[k] !== owed[k]) {
            disagreements.push(`${theme} / ${name} / ${reader}: ${k} printed ${shown[k]}, owed ${owed[k]}`);
          }
        }
        compared++;
      }
    }
    await m.stop();
  }
  assert(compared === truth.length, `${compared} separations read off the screens, ${truth.length} answered`);
  assert(disagreements.length === 0, `${disagreements.length} disagreements:\n  ${disagreements.slice(0, 12).join("\n  ")}`);
});

// The anti-vacuity core. The expected verdict per theme is DERIVED from the
// tarball, so no constant satisfies this: a suite asserting "all pass" is red on
// day one and one asserting "all fail" is red too.
Deno.test("the roster's verdict distribution is the tarball's and not a constant", async () => {
  const m = await open({ screen: "roster" });
  const scores = G.scores(truth);
  const rows = m.all("li.theme-row");
  assert(rows.length === G.THEMES.length, `${rows.length} theme rows for ${G.THEMES.length} themes`);
  const spread = new Set<string>();
  for (const li of rows) {
    const name = textOf([...li.querySelectorAll(".theme-name")][0]);
    const [holds, fails] = cells(li, ["holds", "fails"]);
    const reader = G.readerOf(name);
    const want = scores.find((s) => s.theme === name && s.reader === reader);
    assert(want !== undefined, `${name}: no score for its own reader ${reader}`);
    assert(
      holds === String(want.holds) && fails === String(want.fails),
      `${name} / ${reader}: the roster prints ${holds}/${fails}, the ground truth ${want.holds}/${want.fails}`,
    );
    spread.add(`${want.holds}/${want.fails}`);
  }
  // If every theme scored alike, equality above would be satisfied by one
  // constant. It is not: the distribution is what the fourteen files say.
  assert(spread.size > 1, `every theme scores ${[...spread][0]}, so this comparison grades nothing`);
  await m.stop();
});

const rg = (theme: string) => {
  const s = G.scores(truth).find((x) => x.theme === theme && x.reader === "red-green");
  if (s === undefined) throw new Error(`no red-green score for ${theme}`);
  return s;
};

Deno.test("in light every graded opposition fails for a red-green dichromat", () => {
  const s = rg("light");
  assert(
    s.fails === graded.length && s.holds === 0,
    `light fails ${s.fails} of ${graded.length} under red-green, and holds ${s.holds}`,
  );
});

Deno.test("high contrast buys no colour-vision separation", () => {
  const plain = rg("light"), loud = rg("light-high-contrast");
  assert(
    plain.fails === loud.fails,
    `light fails ${plain.fails} under red-green and light-high-contrast ${loud.fails}`,
  );
  assert(
    sameSet(failingSet("light"), failingSet("light-high-contrast")),
    "the contrast axis moved the red-green failing set",
  );
});

Deno.test("light to light-colorblind improves every graded opposition under red-green and regresses none", () => {
  const s = rg("light-colorblind");
  // A direction, not a constant: what is asserted is that nothing went
  // backwards and everything went forwards, whatever the values are.
  assert(
    s.improved === graded.length && s.regressed === 0,
    `light-colorblind improves ${s.improved} of ${graded.length} and regresses ${s.regressed}`,
  );
});

Deno.test("light to light-tritanopia trades rather than improves, and open/closed is among the regressions", () => {
  const s = G.scores(truth).find((x) => x.theme === "light-tritanopia" && x.reader === "tritanopia")!;
  assert(s.improved > 0 && s.regressed > 0, `${s.improved} improved and ${s.regressed} regressed — not a trade`);
  const openClosed = G.oppositions().filter((o) => o.segment === "open-closed" && o.graded === "true").map((o) => o.id);
  assert(openClosed.length > 0, "the segment rule admits no open/closed pair, so this case grades nothing");
  const back = truth.filter((r) =>
    r.theme === "light-tritanopia" && r.reader === "tritanopia" && openClosed.includes(r.opposition) && r.delta < 0
  );
  assert(
    back.length === openClosed.length,
    `${back.length} of the ${openClosed.length} open/closed pairs regressed under tritanopia`,
  );
});

Deno.test("no theme in the corpus holds both axes", () => {
  const below = (theme: string, reader: string) =>
    truth.filter((r) => r.theme === theme && r.reader === reader && r.verdict === "fails").length;
  // The colorblind theme takes tritan separation from clean to failing, which is
  // the mechanism; the claim is over the whole corpus.
  assert(below("light", "tritanopia") === 0, `light already fails ${below("light", "tritanopia")} under tritanopia`);
  assert(
    below("light-colorblind", "tritanopia") > 0,
    "light-colorblind fails nothing under tritanopia, so fixing red-green cost nothing",
  );
  const clean = G.THEMES.filter((t) => rg(t).fails === 0 && below(t, "tritanopia") === 0);
  assert(clean.length === 0, `${clean.join(", ")} hold both axes`);
});

// The failing SET under red-green, pair for pair. `Score.fails` counts, and two
// themes can fail the same number of different pairs; the claim here is that the
// contrast axis moves the membership not at all.
const failingSet = (theme: string) => {
  const ops = [...new Set(truth.filter((r) => r.theme === theme).map((r) => r.opposition))];
  return new Set(ops.filter((o) => {
    const halves = truth.filter((r) => r.theme === theme && r.opposition === o && r.reader !== "trichromat" && r.reader !== "tritanopia");
    if (halves.length !== 2) throw new Error(`${theme} / ${o}: ${halves.length} red-green halves, not two`);
    return Math.min(...halves.map((h) => h.separation)) < halves[0].floor;
  }));
};

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x));

Deno.test("the dimmed ground is the worst in the corpus, and its high-contrast sibling fixes none of the axis it most needs", () => {
  // "Worst" is the total below-floor count across the three simulations, which is
  // the only reading of it that does not privilege one dichromacy.
  const belowFloor = (theme: string) =>
    truth.filter((r) => r.theme === theme && r.reader !== "trichromat" && r.verdict === "fails").length;
  const ranked = G.THEMES.slice().sort((a, b) => belowFloor(b) - belowFloor(a));
  assert(
    ranked[0] === "dark-dimmed",
    `the worst theme is ${ranked[0]} at ${belowFloor(ranked[0])}, and dark-dimmed is at ${belowFloor("dark-dimmed")}`,
  );
  // The sibling does move two protanopia readings back over the floor, and that
  // is not the claim: on red-green — the reduction a theme named for red-green is
  // judged by — the failing set is the same nineteen pairs.
  assert(
    sameSet(failingSet("dark-dimmed"), failingSet("dark-dimmed-high-contrast")),
    "the dimmed ground's high-contrast sibling moved the red-green failing set",
  );
  assert(
    failingSet("dark-dimmed").size === graded.length,
    `dark-dimmed fails ${failingSet("dark-dimmed").size} of ${graded.length} under red-green`,
  );
});

Deno.test("a pair whose two members never differ is shown, is not graded, and says why", async () => {
  const declined = G.oppositions().filter((o) => o.graded !== "true");
  assert(declined.length > 0, "no pair the rule admits is declined, so this case grades nothing");
  const m = await open({ screen: "theme", params: { theme: "light" } });
  const rows = m.all(".declined li.declined-row");
  assert(rows.length === declined.length, `${rows.length} declined rows shown for ${declined.length}`);
  for (const li of rows) {
    const reason = textOf([...li.querySelectorAll(".reason")][0]);
    assert(reason !== "", "a declined row carries no reason");
  }
  const gradedIds = new Set(m.rows("reading").map((r) => txt(r.opposition)));
  for (const o of declined) {
    assert(!gradedIds.has(o.id), `${o.id} is declined and still has readings`);
  }
  await m.stop();
});

Deno.test("the reader control repaints the same specimen elements", async () => {
  const m = await open({ screen: "theme", params: { theme: "light" } });
  const paintOf = () =>
    m.all("li.op .pair").map((el) => txt(el.getAttribute("style")));
  const before = paintOf();
  assert(before.length === graded.length, `${before.length} specimens painted for ${graded.length} pairs`);
  assert(before.every((s) => s.includes("--left") && s.includes("--right")), "a specimen is painted from nothing");
  await pickReader(m, "deuteranopia");
  const after = paintOf();
  assert(after.length === before.length, `the picker changed the specimen count from ${before.length} to ${after.length}`);
  const moved = after.filter((s, i) => s !== before[i]).length;
  assert(moved > 0, "the reader moved and nothing repainted");
  // The paint has to be the app's own simulation of the theme's own colours, so
  // it is checked against the oracle's rather than merely against "it changed".
  for (const [i, o] of graded.entries()) {
    const want = byId.get(`${o.id}#light#deuteranopia`)!;
    assert(
      after[i].includes(want.left_seen) && after[i].includes(want.right_seen),
      `${o.id}: painted ${after[i]}, owed ${want.left_seen} / ${want.right_seen}`,
    );
  }
  await m.stop();
});
