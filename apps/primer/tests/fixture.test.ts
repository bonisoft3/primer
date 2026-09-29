// The fixture is what everything else stands on, so it is graded against the
// bytes and not against itself.
//
// `fixtures/generate.ts` carries its own reader of the theme stylesheets and
// `tests/ground-truth.ts` carries another. Every assertion below compares those
// two parses; a shared parser would make this file a comparison of a value with
// itself, and the seed would then be graded by nothing at all.

import { appSeed } from "../../../plugins/omnishell/test/screen-harness.ts";
import { assert } from "../../../plugins/omnishell/test/screen-harness.ts";
import * as G from "./ground-truth.ts";

const VENDOR = new URL("../fixtures/primer-primitives-11.10.0/", import.meta.url);
type Pin = { url: string; integrity: string; files: Record<string, string> };
const pin: Pin = JSON.parse(Deno.readTextFileSync(new URL("source.json", VENDOR)));

const sha256 = async (bytes: Uint8Array) =>
  "sha256-" + btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))));

Deno.test("the app's fixture quotes the same archive the platform's scale pins", () => {
  const platform = JSON.parse(
    Deno.readTextFileSync(new URL("../../../plugins/pronto/scales/primer-primitives-11.10.0/source.json", import.meta.url)),
  );
  // The tarball itself is not in the tree — 22MB of it is a docs directory this
  // app reduces to two columns — so what is held equal is the PIN. A vendoring
  // that reached for a different release would have to move this string, and
  // moving it is a reviewed diff in two files at once.
  assert(
    pin.integrity === platform.integrity,
    `the app pins ${pin.integrity} and the platform's scale pins ${platform.integrity}`,
  );
  assert(pin.url === platform.url, `the app pins ${pin.url} and the platform ${platform.url}`);
});

Deno.test("every vendored file is the byte string its own pin names", async () => {
  const names = Object.keys(pin.files).sort();
  assert(names.length > 0, "the pin names no files, so this case grades nothing");
  for (const rel of names) {
    const got = await sha256(await Deno.readFile(new URL(rel, VENDOR)));
    assert(got === pin.files[rel], `${rel} hashes ${got} and its pin says ${pin.files[rel]}`);
  }
  // The vendored validator is its own artifact with its own note, because the
  // path it came from is not re-fetchable.
  const vendorPin = JSON.parse(Deno.readTextFileSync(new URL("../fixtures/vendor/source.json", import.meta.url)));
  const got = await sha256(await Deno.readFile(new URL("../fixtures/vendor/validate_palette.js", import.meta.url)));
  assert(got === vendorPin.integrity, `the palette validator hashes ${got} and its note says ${vendorPin.integrity}`);
});

Deno.test("the theme roster is the tarball's directory listing", () => {
  const files = [...Deno.readDirSync(new URL("themes/", VENDOR))].filter((e) => e.name.endsWith(".css"));
  assert(files.length === G.THEMES.length, `${files.length} theme files for ${G.THEMES.length} themes`);
  // Fourteen of eighteen cells, and the four that are missing all name one
  // ground. Derived from the roster rather than stated beside it.
  const cross = G.GROUNDS.length * G.READERS.filter((r) => r !== "protanopia" && r !== "deuteranopia").length;
  assert(cross > 0, "the cross has no cells");
  const missing = G.GROUNDS.flatMap((g) =>
    ["trichromat", "red-green", "tritanopia"].flatMap((r) =>
      G.CONTRASTS.filter((c) => !G.THEMES.some((t) => G.groundOf(t) === g && G.readerOf(t) === r && G.contrastOf(t) === c))
        .map(() => g)
    )
  );
  assert(missing.length === 4, `${missing.length} cells are unpublished, not four`);
  assert(new Set(missing).size === 1, `the unpublished cells name ${new Set(missing).size} grounds, not one`);
});

Deno.test("each theme declares its 959 names twice and identically", () => {
  const sizes = new Set(G.THEMES.map((t) => G.declarations(t).size));
  // declarations() raises if the explicit block and the auto block disagree, so
  // reaching here at all is the identity holding in all fourteen.
  assert(sizes.size === 1, `the themes declare ${[...sizes].sort().join(", ")} names — not one set`);
  const first = [...G.declsOf(G.THEMES[0]).keys()].sort();
  for (const t of G.THEMES) {
    const mine = [...G.declsOf(t).keys()].sort();
    assert(mine.join() === first.join(), `${t} declares a different set of names from ${G.THEMES[0]}`);
  }
});

Deno.test("the theme layer publishes colour and nothing else", () => {
  const kinds = new Set(G.types().values());
  // A colour, a border shorthand or a shadow list — no radius, spacing, font or
  // duration anywhere. That is what makes a theme audit a colour audit by the
  // vendor's own construction, and it is asserted rather than assumed.
  assert(
    [...kinds].sort().join(",") === "border,color,shadow",
    `the theme layer publishes ${[...kinds].sort().join(", ")}`,
  );
});

Deno.test("every seeded Token row is what a second parse of the bytes says", async () => {
  const seed = await appSeed(G.APP);
  const rows = seed.token;
  assert(Array.isArray(rows), "the app seeds no token collection");
  const owed = G.closure();
  assert(rows.length === owed.length, `${rows.length} seeded token rows, ${owed.length} in the stated closure`);
  const held = new Set(rows.map((r) => String(r.id)));
  for (const { theme, name } of owed) {
    assert(held.has(`${theme}#${name}`), `the closure rule reaches ${theme}#${name} and the seed does not hold it`);
  }
  const types = G.types();
  let checked = 0;
  for (const r of rows) {
    const theme = String(r.theme), name = String(r.name);
    const decls = G.declsOf(theme);
    const raw = decls.get(name);
    assert(raw !== undefined, `${r.id}: the theme declares no such name`);
    assert(r.raw === raw, `${r.id}: seeded raw ${r.raw}, declared ${raw}`);
    assert(r.kind === G.kindOf(raw!), `${r.id}: seeded kind ${r.kind}`);
    assert(String(r.target ?? "") === G.targetOf(raw!), `${r.id}: seeded target ${r.target}`);
    assert(r.chain === G.chain(decls, name).join(" → "), `${r.id}: seeded chain ${r.chain}`);
    assert(r.resolved === G.resolve(decls, name), `${r.id}: seeded resolved ${r.resolved}`);
    assert(r.type === types.get(name), `${r.id}: seeded type ${r.type}, published ${types.get(name)}`);
    assert(
      String(r.describes ?? "") === G.describes(theme, name),
      `${r.id}: seeded description does not match the published one`,
    );
    // The compositing, computed here by the oracle's own route. Both the app and
    // this file read the column, so this is the one place it is graded — and it
    // is graded against a second compositing of the raw declaration.
    if (r.type === "color") {
      assert(
        r.composited === G.painted(theme, name),
        `${r.id}: seeded composited ${r.composited}, owed ${G.painted(theme, name)}`,
      );
    }
    checked++;
  }
  assert(checked === owed.length, `${checked} rows checked, ${owed.length} owed`);
});

Deno.test("a theme's row carries the declarations the screens about it are set in", async () => {
  const seed = await appSeed(G.APP);
  const rows = seed.theme as Record<string, unknown>[];
  assert(Array.isArray(rows) && rows.length === G.THEMES.length, `${rows?.length} seeded theme rows`);
  // The column, and the declaration it has to be. Spelled here rather than
  // imported from the generator, so a column wired to the wrong name fails
  // instead of being compared with itself.
  const worn: Record<string, string> = {
    bg_default: "bgColor-default",
    bg_muted: "bgColor-muted",
    border_default: "borderColor-default",
    fg_default: "fgColor-default",
    fg_muted: "fgColor-muted",
    fg_accent: "fgColor-accent",
    fg_danger: "fgColor-danger",
  };
  for (const r of rows) {
    const theme = String(r.id);
    for (const [col, name] of Object.entries(worn)) {
      const owed = G.painted(theme, name);
      assert(r[col] === owed, `${theme}: ${col} is ${r[col]}, and --${name} composites to ${owed}`);
    }
  }
});

Deno.test("alpha is composited and never dropped", async () => {
  const seed = await appSeed(G.APP);
  const translucent = (seed.token as Record<string, unknown>[])
    .filter((r) => /^#[0-9a-fA-F]{8}$/.test(String(r.resolved)));
  assert(translucent.length > 0, "no seeded declaration carries alpha, so this case grades nothing");
  for (const r of translucent) {
    // Dropping the fourth byte — which the vendored validator's hex reader does
    // silently inside its exported function — is the wrong number that looks
    // right. It is named here so the case fails on it rather than on a total.
    const dropped = String(r.resolved).slice(0, 7);
    const owed = G.painted(String(r.theme), String(r.name));
    assert(r.composited === owed, `${r.id}: composited ${r.composited}, owed ${owed}`);
    if (owed !== dropped) {
      assert(r.composited !== dropped, `${r.id}: composited to the first six digits, which drops the alpha`);
    }
  }
});

Deno.test("the derived rosters are the rules' and not an author's", async () => {
  const seed = await appSeed(G.APP);
  const ops = G.oppositions();
  assert(seed.opposition.length === ops.length, `${seed.opposition.length} seeded oppositions, ${ops.length} derived`);
  for (const [i, o] of ops.entries()) {
    const r = seed.opposition[i];
    for (const k of ["id", "segment", "family", "left_token", "right_token", "specimen", "graded", "declined"] as const) {
      assert(
        String(r[k] ?? "") === String((o as Record<string, unknown>)[k] ?? ""),
        `opposition ${o.id}: seeded ${k} is ${r[k]}, derived ${(o as Record<string, unknown>)[k]}`,
      );
    }
  }
  const pairings = G.pairings();
  assert(seed.pairing.length === pairings.length, `${seed.pairing.length} seeded pairings, ${pairings.length} derived`);
  for (const [i, p] of pairings.entries()) {
    const r = seed.pairing[i];
    for (const k of ["id", "ground_token", "ink_token", "semantic", "ambiguous"] as const) {
      assert(
        String(r[k] ?? "") === String((p as Record<string, unknown>)[k] ?? ""),
        `pairing ${p.id}: seeded ${k} is ${r[k]}, derived ${(p as Record<string, unknown>)[k]}`,
      );
    }
  }
});

Deno.test("the readers' matrices are the published model at the precision both routes multiply", async () => {
  const seed = await appSeed(G.APP);
  const rows = seed.reader as Record<string, unknown>[];
  assert(rows.length === G.READERS.length, `${rows.length} Reader rows for ${G.READERS.length} readings`);
  const KIND: Record<string, string> = { protanopia: "protan", deuteranopia: "deutan", tritanopia: "tritan" };
  for (const r of rows) {
    const id = String(r.id);
    const M = id === "trichromat" ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : G.MACHADO[KIND[id]];
    assert(M !== undefined, `${id}: no published matrix`);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const held = Number(r[`m${i}${j}`]);
        // Held at millionths so that dividing by a million lands on the same
        // double the oracle's decimal literal does. At ten-thousandths it would not, and the two
        // routes would disagree in the last digit.
        assert(held === Math.round(M[i][j] * 1000000), `${id} m${i}${j}: ${held}`);
        assert(held / 1000000 === M[i][j], `${id} m${i}${j}: ${held}/1e6 is not the published coefficient`);
      }
    }
    if (id !== "trichromat") assert(String(r.citation).includes("Machado"), `${id} carries no citation`);
    // One severity, stated on the row rather than implied by the matrix, because
    // the specification screen prints it and a screen that printed a severity
    // nothing asserted would be printing an opinion.
    assert(String(r.severity) === G.SEVERITY[id], `${id}: severity ${r.severity}, owed ${G.SEVERITY[id]}`);
  }
});

Deno.test("the floors are the settled numbers, each carrying where it came from", async () => {
  const seed = await appSeed(G.APP);
  const rows = seed.floor as Record<string, unknown>[];
  const owed = new Map(G.FLOORS.map((f) => [f.id, f]));
  assert(rows.length === owed.size, `${rows.length} Floor rows, ${owed.size} floors`);
  for (const r of rows) {
    const f = owed.get(String(r.id));
    assert(f !== undefined, `no such floor: ${r.id}`);
    assert(Number(r.value) === f.value, `${r.id}: ${r.value} against ${f.value}`);
    assert(String(r.applies) === f.applies, `${r.id}: applies to ${r.applies}`);
    assert(String(r.source) !== "", `${r.id}: no provenance`);
  }
  // The floor a reading is gated by has to BE one of these rows, or the
  // specification screen is showing numbers that gated nothing.
  const values = new Set(rows.filter((r) => r.applies === "separation").map((r) => Number(r.value)));
  for (const reader of [...G.READERS, "red-green"]) {
    assert(values.has(G.floorFor(reader)), `the floor ${G.floorFor(reader)} gating ${reader} is on no Floor row`);
  }
});

// The reimplementation, pinned to the quotation. The vendored validator's
// `deltaE` and `simulate` are module-private, so the oracle carries its own
// fifteen lines; those lines are held to the vendored ones by calling the PUBLIC
// `validate()` on a synthetic two-slot palette and reading the worst-pair ΔE out
// of its report string. Editing the vendored file to export more would turn a
// quotation into a fork.
Deno.test("the oracle's own simulation and distance are the vendored validator's", async () => {
  const { validate } = await import("../fixtures/vendor/validate_palette.js");
  const probes: [string, string][] = [
    ["#1f883d", "#cf222e"],
    ["#0969da", "#bc4c00"],
    ["#8250df", "#1f883d"],
    ["#59636e", "#6e7781"],
  ];
  let pinned = 0;
  for (const [a, b] of probes) {
    const { report } = validate([a, b], { mode: "light" }) as unknown as { report: [string, unknown, string][] };
    const row = report.find(([name]) => name === "CVD separation");
    assert(row !== undefined, "validate() no longer reports a CVD separation row");
    const m = /ΔE (\d+\.\d)\s+\((protan|deutan)\)/.exec(row[2].replaceAll("ΔE", "ΔE"));
    assert(m !== null, `could not read the worst pair out of: ${row[2]}`);
    const theirs = Number(m[1]);
    const mine = Math.min(G.deltaE(a, b, "protan"), G.deltaE(a, b, "deutan"));
    // The vendor prints one decimal, so the pin is to that precision — which is
    // the whole of what a report string can hold.
    assert(
      Math.abs(Number(mine.toFixed(1)) - theirs) < 1e-9,
      `${a}↔${b}: the validator says ΔE ${theirs} and the oracle ${mine.toFixed(1)}`,
    );
    // And which of the two dichromacies is the worse has to agree too, or the
    // two are computing different simulations and agreeing by accident.
    const worse = G.deltaE(a, b, "protan") <= G.deltaE(a, b, "deutan") ? "protan" : "deutan";
    assert(worse === m![2], `${a}↔${b}: the validator's worse reader is ${m![2]} and the oracle's ${worse}`);
    pinned++;
  }
  assert(pinned === probes.length, `${pinned} of ${probes.length} probes pinned`);
});

// The quotation hash is pinned HERE and not in the fixture, so editing the
// fixture cannot move its own target. It covers the fourteen theme stylesheets
// byte for byte, concatenated with every QUOTED sentence in order — the vendor's
// claims, not the language findings. A finding is this platform's own shape and
// rewording one better should not move a number that exists to catch a vendored
// byte drifting; a vendor's sentence is a quotation and moving one has to be a
// reviewed diff here.
const QUOTATION = "cc0b239a31f8ccfb78a046acfc9b11106cbba0b86ea43cb7df9769e8100e05e2";

Deno.test("the quotation is the one this suite pinned", async () => {
  const seed = await appSeed(G.APP);
  const parts: Uint8Array[] = [];
  for (const t of G.THEMES) parts.push(await Deno.readFile(new URL(`themes/${t}.css`, VENDOR)));
  const claims = (seed.claim as Record<string, unknown>[])
    .filter((c) => String(c.kind) !== "language")
    .slice().sort((a, b) => Number(a.pos) - Number(b.pos));
  assert(claims.length > 0, "no claim is a quotation, so the pin covers only the stylesheets");
  const enc = new TextEncoder();
  for (const c of claims) parts.push(enc.encode(String(c.says)));
  const total = parts.reduce((n, p) => n + p.length, 0);
  const all = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    all.set(p, at);
    at += p.length;
  }
  const got = [...new Uint8Array(await crypto.subtle.digest("SHA-256", all))]
    .map((b) => b.toString(16).padStart(2, "0")).join("");
  assert(
    got === QUOTATION,
    `the quotation hashes ${got}; this suite pins ${QUOTATION}. A vendored byte or a quoted sentence moved.`,
  );
});

Deno.test("every vendor claim quotes the vendored guide verbatim", async () => {
  const seed = await appSeed(G.APP);
  const guide = Deno.readTextFileSync(new URL("DESIGN_TOKENS_GUIDE.md", VENDOR));
  const claims = seed.claim as Record<string, unknown>[];
  let quoted = 0;
  for (const c of claims) {
    if (String(c.kind) === "language" || String(c.kind) === "theme-name") continue;
    assert(guide.includes(String(c.says)), `${c.id}: its quotation is not in the vendored guide`);
    quoted++;
  }
  assert(quoted > 0, "no claim quotes the guide, so this case grades nothing");
});

Deno.test("a theme's twin is the other ground's theme with its reader and contrast, and the dimmed ground has none", async () => {
  const seed = await appSeed(G.APP);
  const rows = seed.theme as Record<string, unknown>[];
  const byId = new Map(rows.map((r) => [String(r.id), r]));
  // The oracle's relation is symmetric and empty on the dimmed ground, so one
  // path grades every row: what the seed names must be what the oracle names.
  for (const r of rows) {
    const id = String(r.id), twin = String(r.twin ?? "");
    const owed = G.twinOf(id) ?? "";
    assert(twin === owed, `${id}: seeded twin is ${JSON.stringify(twin)}, owed ${JSON.stringify(owed)}`);
    if (twin !== "") {
      const back = String(byId.get(twin)?.twin ?? "");
      assert(back === id, `${id}: its twin ${twin} names ${JSON.stringify(back)} back`);
    }
    assert(r.wearable === (twin === "" ? "false" : "true"), `${id}: wearable is ${r.wearable} with twin ${JSON.stringify(twin)}`);
  }
});
