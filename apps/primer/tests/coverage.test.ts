// The anti-joins, and the language findings measured by asking cue.
//
// Both directions, because one side is half an oracle. The forward join walks
// what the ground truth ANSWERS and asks which of it no screen shows — an app
// that dropped a whole theme produces no finding anywhere else. The reverse join
// walks what the screens PRINT and asks which of it nothing grades — a figure
// nobody computed is the more serious of the two.
//
// Each anti-join is a pure function over (shown, owed) and each is driven to RED
// on a doctored input by its own case, so a check that has stopped grading
// anything cannot stay green.

import { assert } from "../../../plugins/omnishell/test/screen-harness.ts";
import * as G from "./ground-truth.ts";
import { cells, open, textOf, txt } from "./drive.ts";

const ROOT = new URL("../../../", import.meta.url);
const APP = G.APP;

// --- the two anti-joins, as functions -------------------------------------

/** What the ground truth answers and no screen shows. */
export const unshown = (owed: Iterable<string>, shown: Set<string>): string[] =>
  [...owed].filter((id) => !shown.has(id));

/** What a screen prints and nothing grades. */
export const ungraded = (printed: Iterable<string>, graded: Set<string>): string[] =>
  [...printed].filter((v) => !graded.has(v));

// --- harvesting -----------------------------------------------------------

type Harvest = { readings: Set<string>; figures: Set<string> };

/** Every reading a screen identifies, and every figure it prints. A figure is
 * harvested by CLASS rather than by walking the store, so a number the store
 * holds and the markup never binds is invisible here — which is the whole point
 * of the reverse direction. */
const harvest = async (): Promise<Harvest> => {
  const readings = new Set<string>();
  const figures = new Set<string>();
  const collect = (m: Awaited<ReturnType<typeof open>>) => {
    for (const el of m.all(".fig")) {
      const t = textOf(el);
      if (t !== "") figures.add(t);
    }
  };
  for (const theme of G.THEMES) {
    const m = await open({ screen: "theme", params: { theme } });
    for (const block of m.all("li.op")) {
      const name = textOf([...block.querySelectorAll("h2 a")][0]);
      for (const li of block.querySelectorAll("li.reading")) {
        readings.add(`${name}#${theme}#${cells(li, ["who"])[0]}`);
      }
    }
    collect(m);
    await m.stop();
  }
  for (const o of G.oppositions().filter((x) => x.graded === "true")) {
    const m = await open({ screen: "opposition", params: { opposition: o.id } });
    for (const li of m.all("li.cell-reading")) {
      const [theme, reader] = cells(li, ["theme-name", "who"]);
      readings.add(`${o.id}#${theme}#${reader}`);
    }
    collect(m);
    await m.stop();
  }
  for (const screen of ["roster", "spec"]) {
    const m = await open({ screen });
    collect(m);
    await m.stop();
  }
  for (const theme of G.THEMES) {
    for (const screen of ["pairings", "tokens"]) {
      const m = await open({ screen, params: { theme } });
      collect(m);
      await m.stop();
    }
  }
  return { readings, figures };
};

const shown = await harvest();

Deno.test("every reading the ground truth answers is shown by some screen", () => {
  const owed = G.readings().map((r) => r.id);
  const missing = unshown(owed, shown.readings);
  assert(
    missing.length === 0,
    `${missing.length} of ${owed.length} readings are answered and shown nowhere:\n  ${missing.slice(0, 8).join("\n  ")}`,
  );
});

Deno.test("the forward anti-join is driven to red on a doctored input", () => {
  const owed = G.readings().map((r) => r.id);
  const doctored = new Set(shown.readings);
  const dropped = owed[Math.floor(owed.length / 2)];
  doctored.delete(dropped);
  const found = unshown(owed, doctored);
  // A screen with one number removed. If this comes back empty the anti-join has
  // stopped grading and the case above is green over nothing.
  assert(found.length === 1 && found[0] === dropped, `the anti-join found ${found.length} findings, not the one dropped`);
});

Deno.test("every figure any screen prints is graded by some obligation", async () => {
  const graded = new Set<string>();
  for (const r of G.readings()) {
    graded.add(String(r.separation));
    graded.add(String(r.floor));
    graded.add(String(r.delta));
  }
  for (const r of await G.ratios()) graded.add(String(r.ratio));
  for (const s of G.scores()) {
    for (const k of ["holds", "fails", "improved", "regressed", "unchanged"] as const) graded.add(String(s[k]));
  }
  for (const c of G.census()) graded.add(String(c.count));
  for (const f of G.FLOORS) graded.add(String(f.value));
  for (const p of G.pairings()) graded.add(String(p.threshold_filed));
  // A colour is a figure the fixture graded, and so is a resolution chain: the
  // declarations screen prints the audit's own columns and every one of them is
  // held to the bytes in fixture.test.ts.
  for (const { theme, name } of G.closure()) {
    graded.add(G.resolve(G.declsOf(theme), name));
    if (G.types().get(name) === "color") graded.add(G.painted(theme, name));
  }
  // The readers' matrices and the type roles, which the specification screen
  // prints and which fixture.test.ts and this file grade respectively.
  const KIND: Record<string, string> = { protanopia: "protan", deuteranopia: "deutan", tritanopia: "tritan" };
  for (const id of G.READERS) {
    const M = id === "trichromat" ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : G.MACHADO[KIND[id]];
    for (const row of M) for (const v of row) graded.add(String(Math.round(v * 1000000)));
    graded.add(G.SEVERITY[id]);
  }
  for (const r of typeRungs()) {
    graded.add(r.value);
    graded.add(r.resolved);
  }
  const orphans = ungraded(shown.figures, graded);
  assert(
    orphans.length === 0,
    `${orphans.length} of ${shown.figures.size} printed figures are graded by nothing:\n  ${orphans.slice(0, 12).join("\n  ")}`,
  );
});

Deno.test("the reverse anti-join is driven to red on a doctored input", () => {
  const graded = new Set(["600", "1500"]);
  // A figure on a screen that no obligation answers — the shape of a number
  // somebody typed into markup.
  const printed = new Set(["600", "1500", "4242"]);
  const found = ungraded(printed, graded);
  assert(found.length === 1 && found[0] === "4242", `the anti-join found ${found.length} findings, not the one planted`);
});

// --- the ledger -----------------------------------------------------------

const read = (rel: string) => Deno.readTextFileSync(new URL(rel, APP));

Deno.test("every claim in the ledger is cited by the ir and by the program", async () => {
  const ledger = [...read("acceptance.md").matchAll(/\{#(accept-[a-z0-9-]+)\}/g)].map((m) => m[1]);
  assert(ledger.length > 0, "the ledger states no claims, so this case grades nothing");
  assert(new Set(ledger).size === ledger.length, "the ledger states a claim twice");
  const ir = read("ir.html");
  const irCited = new Set(
    [...ir.matchAll(/data-accepts="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean)),
  );
  const pathCited = new Set(
    [...ir.matchAll(/"accepts":\s*\[([^\]]*)\]/g)].flatMap((m) =>
      [...m[1].matchAll(/"(accept-[a-z0-9-]+)"/g)].map((x) => x[1])
    ),
  );
  const program = await cue(["export", ".", "-e", "code.meta.tests", "--out", "json"], APP);
  assert(program.ok, `cue could not export the program's tests:\n${program.out}`);
  const tests = JSON.parse(program.out) as Record<string, { accepts: string[] }>;
  const progCited = new Set(Object.values(tests).flatMap((t) => t.accepts));
  const missing = {
    ir: ledger.filter((c) => !irCited.has(c) && !pathCited.has(c)),
    program: ledger.filter((c) => !progCited.has(c)),
  };
  assert(missing.ir.length === 0, `${missing.ir.length} claims no ir element cites: ${missing.ir.join(", ")}`);
  assert(
    missing.program.length === 0,
    `${missing.program.length} claims no program test cites: ${missing.program.join(", ")}`,
  );
  // And nothing cites a claim the ledger does not state, which is the other
  // direction and the one that lets a renamed claim rot quietly.
  const invented = [...new Set([...irCited, ...pathCited, ...progCited])].filter((c) => !ledger.includes(c));
  assert(invented.length === 0, `${invented.length} cited claims are in no ledger line: ${invented.join(", ")}`);
});

Deno.test("every claim on the specification screen carries a reading and a verdict", async () => {
  const m = await open({ screen: "spec" });
  const rows = m.all("li.claim");
  const held = m.rows("claim");
  assert(rows.length === held.length, `${rows.length} claims on the screen, ${held.length} in the store`);
  assert(rows.length > 0, "the specification screen shows no claim");
  for (const li of rows) {
    const says = textOf([...li.querySelectorAll(".says")][0]);
    const reads = textOf([...li.querySelectorAll(".reads")][0]);
    const departs = textOf([...li.querySelectorAll(".departs")][0]);
    assert(says !== "", "a claim carries no quotation");
    assert(reads !== "", `a claim carries no reading: ${says.slice(0, 40)}`);
    assert(departs !== "", `a claim carries no verdict: ${says.slice(0, 40)}`);
    // Three columns and never merged: a departure that could be reworded away
    // would not be one, so the reading must not simply repeat the claim.
    assert(reads !== says, `a claim's reading is its own quotation: ${says.slice(0, 40)}`);
  }
  await m.stop();
});

Deno.test("every language finding carries the probe that measured it", async () => {
  const m = await open({ screen: "spec" });
  const language = m.rows("claim").filter((r) => txt(r.kind) === "language");
  assert(language.length > 0, "no language finding is recorded, so this case grades nothing");
  for (const r of language) {
    assert(txt(r.probe) !== "", `${r.id}: a language finding with no probe is a sentence claiming itself`);
  }
  const onScreen = m.all("li.claim[data-kind=\"language\"] .probe").map((el) => textOf(el)).filter((t) => t !== "");
  assert(
    onScreen.length === language.length,
    `${onScreen.length} of ${language.length} language findings show their probe`,
  );
  await m.stop();
});

// --- the language probes --------------------------------------------------

// A file URL is what Deno.Command takes as a cwd on every platform; its
// pathname is not a path on Windows.
const cue = async (args: string[], cwd: URL = ROOT, stdin?: string) => {
  const p = new Deno.Command("cue", {
    args,
    cwd,
    stdin: stdin === undefined ? "null" : "piped",
    stdout: "piped",
    stderr: "piped",
  }).spawn();
  if (stdin !== undefined) {
    const w = p.stdin.getWriter();
    await w.write(new TextEncoder().encode(stdin)).catch(() => {});
    await w.close().catch(() => {});
  }
  const r = await p.output();
  const dec = new TextDecoder();
  return { ok: r.success, out: dec.decode(r.stdout) + dec.decode(r.stderr) };
};

const design = (body: string) =>
  cue(
    ["export", "plugins/pronto/schema.cue", "plugins/pronto/types.cue", "-", "-e", "out", "--out", "json"],
    ROOT,
    `package pronto\n\nout: #Design & {\n${body}\n}\n`,
  );

Deno.test("the design layer holds one identity in two appearances, and cue says so", async () => {
  // A third appearance bucket. `dark` is the twin and it is a closed struct, so a
  // second one is refused by name — which is what makes fourteen selectable
  // appearances inexpressible rather than merely unusual.
  const third = await design(`\tdim: {primary: "#000000"}`);
  assert(!third.ok, "a third appearance bucket was admitted, so a twin is not the limit");
  assert(/dim: field not allowed/.test(third.out), `a third appearance failed for another reason:\n${third.out}`);
  // A second named identity, refused by name on #App.surface.design.
  const second = await cue(
    ["export", "plugins/pronto/schema.cue", "plugins/pronto/types.cue", "-", "-e", "out", "--out", "json"],
    ROOT,
    `package pronto\n\nout: #App.surface & {\n\tdesign: #Design\n\tsecond: #Design\n}\n`,
  );
  assert(!second.ok, "#App.surface admitted a second design, so an app can hold two identities");
  assert(/second: field not allowed/.test(second.out), `a second identity failed for another reason:\n${second.out}`);
  // And the twin is exactly the colour set — a missing half and an orphan half
  // are both errors, which is the other half of "closed".
  const orphan = await design(`\tdark: {"no-such-role": "#000000"}`);
  assert(!orphan.ok, "the dark twin admitted a role the light half does not declare");
});

Deno.test("the twin closure over the vendor's fourteen is the join the roster prints", async () => {
  const wearable = G.THEMES.filter((t) => G.groundOf(t) === "light" && G.twinOf(t) !== undefined);
  // A pronto identity is one LIGHT-ground theme and one DARK-ground theme. The
  // dimmed ground is a third ground, so pairing light against dark-dimmed would
  // be inventing a light half for it — which is the workaround this app refuses,
  // and why the rule is stated over the two grounds that pair rather than over
  // "some other ground".
  const orphans = G.THEMES.filter((t) => G.groundOf(t) === "dark-dimmed");
  assert(wearable.length === 6, `${wearable.length} light-ground themes have a dark twin, not six`);
  assert(orphans.length === 2, `${orphans.length} themes have no twin, not two`);
  assert(
    new Set(orphans.map(G.groundOf)).size === 1,
    `the twinless themes are on ${new Set(orphans.map(G.groundOf)).size} grounds, not one`,
  );
  const m = await open({ screen: "roster" });
  assert(m.all("li.twin").length === wearable.length, `${m.all("li.twin").length} twin rows for ${wearable.length} pairs`);
  assert(m.all("li.orphan").length === orphans.length, `${m.all("li.orphan").length} orphan rows for ${orphans.length}`);
  // No light half is invented for the dimmed ground: no twin row names it.
  for (const li of m.all("li.twin")) {
    assert(!textOf(li).includes("dimmed"), `a twin row names the dimmed ground: ${textOf(li)}`);
  }
  await m.stop();
});

// --- the type roles -------------------------------------------------------

type TypeRung = { purpose: string; value: string; resolved: string; dimension: string; coincides: string };
const typeRungs = (): TypeRung[] => JSON.parse(read("fixtures/typerungs.json"));

Deno.test("the type roles are what the emitted stylesheet declares, and the shadowing is measured off it", async () => {
  // Re-read both sides here rather than trusting the fixture: a stale
  // fixtures/typerungs.json is exactly the drift the finding cannot survive.
  const css = read("shell/design.css");
  const declared = new Map(
    [...css.matchAll(/^\s*--type-([A-Za-z0-9-]+):\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]),
  );
  const rows = typeRungs();
  assert(declared.size > 0, "the emitted stylesheet declares no type role");
  assert(rows.length === declared.size, `${rows.length} TypeRung rows for ${declared.size} emitted roles`);
  const value = (v: string): string => {
    const m = /^var\(--type-([A-Za-z0-9-]+)\)$/.exec(v);
    return m === null ? v : value(declared.get(m[1])!);
  };
  const steps: Record<string, Record<string, string>> = {};
  for (const [dimension, bucket] of [["text", "text"], ["leading", "leading"]]) {
    const r = await cue(["export", "plugins/pronto/schema.cue", "plugins/pronto/types.cue", "-e", `#scale.buckets.${bucket}`, "--out", "json"]);
    assert(r.ok, `cue could not export the ${bucket} bucket:\n${r.out}`);
    const b = JSON.parse(r.out) as { prefix: string; steps: Record<string, string> };
    steps[dimension] = Object.fromEntries(Object.entries(b.steps).map(([k, v]) => [v, `${b.prefix}${k}`]));
  }
  let shadowing = 0;
  for (const row of rows) {
    assert(declared.get(row.purpose) === row.value, `${row.purpose}: the row says ${row.value}`);
    assert(value(row.value) === row.resolved, `${row.purpose}: resolves to ${value(row.value)}`);
    const owed = steps[row.dimension][row.resolved] ?? "";
    assert(row.coincides === owed, `${row.purpose}: the row says it coincides with "${row.coincides}", owed "${owed}"`);
    if (owed !== "") shadowing++;
  }
  const shadowed = new Set(rows.filter((r) => r.coincides !== "").map((r) => r.coincides));
  const total = Object.keys(steps.text).length + Object.keys(steps.leading).length;
  // The finding, as a number rather than a sentence: naming these purposes drops
  // this many vendored steps from what this app's literal lint can teach.
  assert(shadowing > 0, "no purpose coincides with a vendored step, so the finding has nothing in it");
  assert(
    shadowed.size < total,
    `every one of the ${total} vendored steps is shadowed, so the ladder is gone entirely`,
  );
  assert(
    rows.some((r) => r.coincides === ""),
    "every purpose sits on a vendored step, so no purpose demonstrates a value the ladders lack",
  );
});

Deno.test("the specification screen prints which purposes coincide with a rung and which do not", async () => {
  const m = await open({ screen: "spec" });
  const rows = m.all("li.type-row");
  const owed = typeRungs();
  assert(rows.length === owed.length, `${rows.length} type rows on the screen, ${owed.length} measured`);
  let named = 0, unnamed = 0;
  for (const li of rows) {
    const [purpose, value, , dimension, coincides] = cells(li, ["purpose", "value", "resolved", "dimension", "coincides"]);
    const row = owed.find((r) => r.purpose === purpose);
    assert(row !== undefined, `the screen shows a purpose the measurement does not: ${purpose}`);
    assert(value === row.value, `${purpose}: the screen prints ${value}`);
    assert(dimension === row.dimension, `${purpose}: the screen files it under ${dimension}`);
    assert(coincides === row.coincides, `${purpose}: the screen says it coincides with "${coincides}"`);
    if (coincides === "") unnamed++;
    else named++;
  }
  assert(named > 0 && unnamed > 0, `${named} coincide and ${unnamed} do not — the screen shows only one side`);
  await m.stop();
});

// --- read-only, and the verdict is a word ---------------------------------

Deno.test("no verdict on any screen is distinguishable by colour alone", async () => {
  for (const [screen, params] of [["theme", { theme: "light" }], ["pairings", { theme: "dark-dimmed" }]] as const) {
    const m = await open({ screen, params });
    const words = m.all(".word");
    assert(words.length > 0, `${screen} carries no verdict word`);
    for (const el of words) {
      // Every verdict differs in TEXT. A verdict distinguished by a class alone
      // would be unreadable to one of the three readers this app serves, and its
      // own subject is the proof.
      assert(textOf(el) !== "", `${screen}: a verdict element carries no word`);
    }
    // And no stylesheet in this app may hold a colour literal, so a verdict
    // cannot be tinted by one even accidentally.
    for (const rel of ["shell/shared/sheet.css", "shell/screens/theme.css", "shell/screens/pairings.css"]) {
      const css = read(rel);
      const literals = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
      assert(literals.length === 0, `${rel} holds ${literals.length} colour literals: ${literals.join(", ")}`);
    }
    await m.stop();
  }
});

Deno.test("nothing the reader can do writes to a seeded collection", async () => {
  const m = await open({ screen: "theme", params: { theme: "light" } });
  const seeded = ["token", "theme", "cell", "segment", "reader", "floor", "opposition", "pairing", "claim", "type_rung"];
  const offending = m.store.calls.filter((c) => c.op !== "query" && seeded.includes(c.table));
  assert(offending.length === 0, `${offending.length} writes reached a seeded collection: ${JSON.stringify(offending.slice(0, 3))}`);
  // And the only form on any screen writes the one cursor row.
  const forms = m.all("form");
  assert(forms.length > 0, "the audit screen has no control at all");
  for (const f of forms) {
    assert(txt(f.getAttribute("data-entity")) === "cursor", `a form writes ${f.getAttribute("data-entity")}`);
  }
  await m.stop();
});
