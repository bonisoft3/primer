// The reader axis stops at the semantic layer, and this is the file that measures
// it rather than saying it.
//
// One measured fact and one refusal to grade, with the number as the reason: a
// seventeen-slot categorical set cannot clear an all-pairs floor, so grading the
// chart palette would be vacuous in the OTHER direction — the same failure in all
// fourteen themes, saying nothing about any of them.

import { assert } from "../../../plugins/omnishell/test/screen-harness.ts";
import * as G from "./ground-truth.ts";
import { cells, open, textOf, txt } from "./drive.ts";

const truth = new Map(G.census().map((c) => [c.id, c]));

Deno.test("every census figure the screen prints equals the independent route's", async () => {
  const m = await open({ screen: "tokens", params: { theme: G.NOMINATED } });
  const rows = m.all(".census li.census-row");
  assert(rows.length === truth.size, `${rows.length} census rows shown, ${truth.size} computed`);
  const held = m.rows("census");
  for (const li of rows) {
    const count = textOf([...li.querySelectorAll(".count")][0]);
    const fact = textOf([...li.querySelectorAll(".fact")][0]);
    const row = held.find((r) => txt(r.fact) === fact);
    assert(row !== undefined, `no Census row states "${fact}"`);
    const want = truth.get(txt(row.id));
    assert(want !== undefined, `the ground truth answers no census fact "${row.id}"`);
    assert(count === String(want.count), `${row.id}: the screen prints ${count}, the ground truth ${want.count}`);
    assert(textOf([...li.querySelectorAll(".says")][0]) !== "", `${row.id}: no sentence saying what it means`);
  }
  await m.stop();
});

Deno.test("the categorical chart colours are constant within each ground, so the reader axis never reaches them", () => {
  const slots = G.chartSlots();
  assert(slots.length > 0, "the declarations name no chart colour, so this case grades nothing");
  const moved: string[] = [];
  for (const name of slots) {
    for (const g of G.GROUNDS) {
      const values = new Set(
        G.THEMES.filter((t) => G.groundOf(t) === g).map((t) => G.resolve(G.declsOf(t), name)),
      );
      if (values.size !== 1) moved.push(`${name} on ${g}: ${[...values].join(", ")}`);
    }
  }
  assert(moved.length === 0, `the reader or contrast axis moves ${moved.length} chart slots:\n  ${moved.join("\n  ")}`);
  // And they DO move with the ground, so this is not a family nothing touches:
  // it is a family the reader axis specifically does not touch.
  const acrossGrounds = new Set(G.THEMES.map((t) => G.resolve(G.declsOf(t), slots[0])));
  assert(acrossGrounds.size > 1, `${slots[0]} is the same in every ground too, so "ground-only" says nothing`);
});

Deno.test("grading the chart palette would be vacuous, and the number is the reason", () => {
  const worst = truth.get("chart-separation");
  assert(worst !== undefined, "the census does not carry the chart palette's separation");
  const floor = G.floorFor("protanopia");
  // Under half a unit against a floor of six: no seventeen-slot categorical set
  // could clear an all-pairs floor, in any theme, for any reader. That is what
  // makes declining to grade it honest rather than convenient.
  assert(worst.count < 50, `the worst chart separation is ${worst.count} at hundredths`);
  assert(worst.count < floor, `the worst chart separation ${worst.count} is not under the floor ${floor}`);
  // Nothing is graded on it: no Reading row names a chart slot.
  const slots = new Set(G.chartSlots());
  const graded = G.oppositions().filter((o) => o.graded === "true");
  const reached = graded.filter((o) => slots.has(o.left_token) || slots.has(o.right_token));
  assert(reached.length === 0, `${reached.length} graded pairs name a chart colour`);
});

Deno.test("a token that is a literal in one theme and an alias in another is visible as both", async () => {
  const names = [...G.declsOf(G.THEMES[0]).keys()];
  // Only a name the app HOLDS in both themes can be shown as both, and the
  // closure reaches a subset elsewhere — asking about a name it does not hold
  // would be grading the closure rather than the value class.
  const reach = new Set(G.reached());
  const changers = names.filter((n) =>
    reach.has(n) && new Set(G.THEMES.map((t) => G.kindOf(G.declsOf(t).get(n)!))).size > 1
  );
  assert(changers.length > 0, "no declaration changes value class, so this case grades nothing");
  const name = changers.find((n) =>
    G.kindOf(G.declsOf(G.NOMINATED).get(n)!) === "literal" &&
    G.THEMES.some((t) => G.kindOf(G.declsOf(t).get(n)!) === "alias")
  );
  assert(name !== undefined, `no class-changer is a literal in ${G.NOMINATED}`);
  const other = G.THEMES.find((t) => G.kindOf(G.declsOf(t).get(name!)!) === "alias")!;
  const kindOnScreen = async (theme: string) => {
    const m = await open({ screen: "tokens", params: { theme } });
    const row = m.all("li.token-row").find((li) => textOf([...li.querySelectorAll(".name")][0]) === name);
    assert(row !== undefined, `${theme}: the declarations screen does not show --${name}`);
    const [kind, chain] = cells(row!, ["kind", "chain"]);
    await m.stop();
    return { kind, chain };
  };
  const here = await kindOnScreen(G.NOMINATED);
  const there = await kindOnScreen(other);
  assert(here.kind === "literal", `${G.NOMINATED} / --${name}: shown as ${here.kind}`);
  assert(there.kind === "alias", `${other} / --${name}: shown as ${there.kind}`);
  // The chain is on the screen for every token that is one, resolved in its own
  // theme: a chain that read the same in both would be resolving across themes.
  assert(there.chain.includes("→"), `${other} / --${name}: an alias with no chain on the screen`);
  assert(!here.chain.includes("→"), `${G.NOMINATED} / --${name}: a literal with a chain`);
});

Deno.test("an alias that retargets between themes resolves in its own theme on the screen", async () => {
  const names = [...G.declsOf(G.THEMES[0]).keys()];
  const reach = new Set(G.reached());
  const retarget = names.filter((n) =>
    reach.has(n) && G.THEMES.every((t) => G.kindOf(G.declsOf(t).get(n)!) === "alias") &&
    new Set(G.THEMES.map((t) => G.targetOf(G.declsOf(t).get(n)!))).size > 1
  );
  assert(retarget.length > 0, "no alias retargets, so this case grades nothing");
  const name = retarget[0];
  const targets = new Map<string, string>();
  for (const theme of [G.NOMINATED, ...G.THEMES.filter((t) => G.targetOf(G.declsOf(t).get(name)!) !== G.targetOf(G.declsOf(G.NOMINATED).get(name)!))].slice(0, 2)) {
    const m = await open({ screen: "tokens", params: { theme } });
    const row = m.all("li.token-row").find((li) => textOf([...li.querySelectorAll(".name")][0]) === name);
    assert(row !== undefined, `${theme}: the declarations screen does not show --${name}`);
    targets.set(theme, cells(row!, ["chain"])[0]);
    await m.stop();
  }
  assert(new Set(targets.values()).size === 2, `--${name} shows the same chain in both themes: ${[...targets.values()].join(" | ")}`);
});

Deno.test("the closure rule is stated on the screen rather than presented as the whole system", async () => {
  const m = await open({ screen: "tokens", params: { theme: G.NOMINATED } });
  const note = textOf(m.all(".note")[0]);
  assert(note.includes("closure"), "the declarations screen does not state its closure rule");
  assert(note.includes(G.NOMINATED), `the screen does not name the nominated theme`);
  // The nominated theme is shown entire; another is shown as far as the closure
  // reaches, and the two counts differ — which is what the sentence is about.
  const here = m.all("li.token-row").length;
  await m.stop();
  const other = G.THEMES.find((t) => t !== G.NOMINATED)!;
  const m2 = await open({ screen: "tokens", params: { theme: other } });
  const there = m2.all("li.token-row").length;
  await m2.stop();
  assert(here === G.declsOf(G.NOMINATED).size, `${G.NOMINATED} shows ${here} of ${G.declsOf(G.NOMINATED).size} declarations`);
  assert(there < here, `${other} shows ${there} rows and ${G.NOMINATED} ${here} — the closure cuts nothing`);
});

// The whole published system, which the app cannot print because it holds one
// theme entire and the audit's closure elsewhere. These are the numbers the
// language findings stand on, graded here against the bytes.
Deno.test("the corpus facts the language findings stand on", () => {
  const c = G.corpusCensus();
  assert(c.declared === G.declsOf(G.THEMES[0]).size, `${c.declared} declarations`);
  // The dimmed ground is a third ground and not a variant of dark: about a third
  // of the corpus differs between them, which is why pairing it against a light
  // half is not merely inconvenient.
  assert(
    c.dimmedVsDark > c.declared / 4 && c.dimmedVsDark < c.declared / 2,
    `${c.dimmedVsDark} of ${c.declared} declarations differ between dark and dark-dimmed`,
  );
  // A tenth or so of the nominated theme resolves to a translucent colour, which
  // is why compositing is mandatory rather than a refinement.
  assert(c.alphaInNominated > c.declared / 20, `${c.alphaInNominated} of ${c.declared} carry alpha`);
  assert(c.retargeting > 0, "no alias in the corpus retargets between themes");
  assert(c.classChangers > 0, "no declaration in the corpus changes value class");
  // Half or so of the corpus never moves on the reader or contrast axis at all,
  // which is the shape of a design system whose accessibility themes are for its
  // semantics.
  assert(
    c.groundOnly > c.declared / 4,
    `only ${c.groundOnly} of ${c.declared} declarations are constant within each ground`,
  );
});
