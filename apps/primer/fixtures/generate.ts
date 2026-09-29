// The seed, written from the vendored tarball's bytes.
//
//   deno run --allow-read=. --allow-write=fixtures fixtures/generate.ts
//
// Its own reader, deliberately: `tests/ground-truth.ts` parses the same bytes a
// second time and `fixture` holds every row here equal to what that parse says.
// Importing the oracle's parser would make that check a comparison of a value
// with itself, and the seed would then be graded by nothing at all.

const VENDOR = new URL("primer-primitives-11.10.0/", import.meta.url);
const OUT = new URL("./", import.meta.url);

const read = (rel: string) => Deno.readTextFileSync(new URL(rel, VENDOR));

// Every boolean below is written as the STRING "true" or "false". A data-filter
// compares against text, so a JSON boolean in a seeded row is a row no filter can
// reach — it renders as a word and matches nothing, silently.
//
// --- the roster ------------------------------------------------------------

const stems = [...Deno.readDirSync(new URL("themes/", VENDOR))]
  .filter((e) => e.isFile && e.name.endsWith(".css")).map((e) => e.name.slice(0, -4));

const ground = (t: string) => t.startsWith("dark-dimmed") ? "dark-dimmed" : t.startsWith("dark") ? "dark" : "light";
const reader = (t: string) => t.includes("colorblind") ? "red-green" : t.includes("tritanopia") ? "tritanopia" : "trichromat";
const contrast = (t: string) => t.endsWith("high-contrast") ? "high" : "normal";

const GROUNDS = ["light", "dark", "dark-dimmed"];
const READERS = ["trichromat", "red-green", "tritanopia"];
const CONTRASTS = ["normal", "high"];

const order = (t: string) =>
  GROUNDS.indexOf(ground(t)) * 100 + READERS.indexOf(reader(t)) * 10 + CONTRASTS.indexOf(contrast(t));
const THEMES = stems.slice().sort((a, b) => order(a) - order(b) || (a < b ? -1 : 1));

const base = (t: string) =>
  THEMES.find((x) => ground(x) === ground(t) && reader(x) === "trichromat" && contrast(x) === "normal")!;

// Which of the two appearance halves a theme could be. A pronto identity holds
// one identity in two appearances, so a theme is wearable only if the theme
// matching it on (reader, contrast) across the light/dark grounds exists. The
// dimmed ground is on neither side of that pair: it has no twin, and a light
// theme is never its half.
const OTHER_GROUND: Record<string, string> = { light: "dark", dark: "light" };
const twinOf = (t: string) =>
  THEMES.find((x) => ground(x) === OTHER_GROUND[ground(t)] && reader(x) === reader(t) && contrast(x) === contrast(t));
const wearable = (t: string) => twinOf(t) !== undefined;

// --- the declarations ------------------------------------------------------

/** This generator's own reader. It takes the explicit `data-color-mode` block
 * and stops at the auto block; holding the two equal is the oracle's job, and
 * doing it in both places would be one claim written twice. */
function parse(theme: string): Map<string, string> {
  const src = read(`themes/${theme}.css`);
  const auto = src.indexOf("@media");
  const body = src.slice(0, auto < 0 ? src.length : auto);
  const out = new Map<string, string>();
  for (const line of body.split("\n")) {
    const at = line.indexOf("--");
    if (at < 0) continue;
    const colon = line.indexOf(":", at);
    const semi = line.indexOf(";", colon);
    if (colon < 0 || semi < 0) continue;
    out.set(line.slice(at + 2, colon).trim(), line.slice(colon + 1, semi).trim());
  }
  return out;
}

const DECLS = new Map(THEMES.map((t) => [t, parse(t)]));
const published: Record<string, Record<string, { type: string; describes: string }>> = JSON.parse(read("published.json"));

// A whole value that is one var(), and nothing looser: a border shorthand opens
// `var(--borderWidth-default) solid …`, and reading that as an alias walks into
// the base layer this file never sees and calls a shorthand a colour.
const ALIAS = /^var\(--([A-Za-z0-9-]+)\)$/;
const aliased = (v: string) => ALIAS.exec(v.trim())?.[1] ?? "";

function walk(theme: string, name: string): string[] {
  const chain: string[] = [];
  let cur = name;
  while (true) {
    if (chain.includes(cur)) throw new Error(`alias cycle at --${cur} in ${theme}`);
    chain.push(cur);
    const v = DECLS.get(theme)!.get(cur);
    if (v === undefined) throw new Error(`--${cur} named and never declared in ${theme}`);
    const next = aliased(v);
    if (next === "") return chain;
    cur = next;
  }
}
const resolved = (theme: string, name: string) => {
  const chain = walk(theme, name);
  return DECLS.get(theme)!.get(chain[chain.length - 1])!;
};

const hexBytes = (v: string) => {
  const h = v.trim().replace("#", "");
  const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return [n[0], n[1], n[2], h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
};
const pad = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, "0");
const over = (v: string, g: string) => {
  const c = hexBytes(v);
  if (c[3] === 1) return `#${pad(c[0])}${pad(c[1])}${pad(c[2])}`;
  const b = hexBytes(g);
  return `#${[0, 1, 2].map((i) => pad(c[i] * c[3] + b[i] * (1 - c[3]))).join("")}`;
};

const GROUND_OF = new Map(THEMES.map((t) => [t, resolved(t, "bgColor-default")]));

// The declarations a theme's own row carries, so a screen ABOUT one theme can be
// SET in it. Composited over the theme's default ground, because a translucent
// value bound as a page role would let whatever is behind the page show through
// the subject. Which of the app's design roles each column is bound to is
// screens.cue's to say.
const WORN: Record<string, string> = {
  bg_default: "bgColor-default",
  bg_muted: "bgColor-muted",
  border_default: "borderColor-default",
  fg_default: "fgColor-default",
  fg_muted: "fgColor-muted",
  fg_accent: "fgColor-accent",
  fg_danger: "fgColor-danger",
};
const worn = (t: string) =>
  Object.fromEntries(
    Object.entries(WORN).map(([col, name]) => [col, over(resolved(t, name), GROUND_OF.get(t)!)]),
  );

// --- the opposition roster -------------------------------------------------

const SEGMENTS = [
  { id: "success-danger", left: "success", right: "danger", says: "a check that passed against one that failed", pos: 1 },
  { id: "open-closed", left: "open", right: "closed", says: "an issue still open against one closed", pos: 2 },
  { id: "inserted-deleted", left: "inserted", right: "deleted", says: "a line a patch adds against one it removes, in highlighted source", pos: 3 },
  { id: "additionLine-deletionLine", left: "additionLine", right: "deletionLine", says: "a whole added line of a diff against a removed one", pos: 4 },
  { id: "additionNum-deletionNum", left: "additionNum", right: "deletionNum", says: "the line number beside an addition against the one beside a deletion", pos: 5 },
  { id: "additionWord-deletionWord", left: "additionWord", right: "deletionWord", says: "the changed words inside an added line against those inside a removed one", pos: 6 },
];

const SPECIMENS: [RegExp, string, string][] = [
  [/^bgColor-.*-emphasis$/, "badge-solid", "two solid state badges"],
  [/^bgColor-.*-muted$/, "badge-soft", "two soft state badges"],
  [/^control-borderColor-/, "field", "two field outlines"],
  [/^borderColor-|^border-/, "rule", "two bordered chips"],
  [/^fgColor-/, "ink", "two words of state text"],
  [/^progressBar-/, "meter", "two meter fills"],
  [/^diffBlob-.*Line-bgColor$/, "diff-line", "an added diff line beside a removed one"],
  [/^diffBlob-.*Num-bgColor$/, "diff-gutter", "an added line number beside a removed one"],
  [/^diffBlob-.*Word-bgColor$/, "diff-word", "changed words inside an added line beside a removed one"],
  [/^diffBlob-.*-fgColor$/, "diff-ink", "the ink of an added line beside that of a removed one"],
  [/prettylights-syntax-markup-.*-bg$/, "syntax-line", "a highlighted added line beside a removed one"],
  [/prettylights-syntax-markup-.*-text$/, "syntax-ink", "highlighted added source beside removed source"],
];

const names = [...DECLS.get(THEMES[0])!.keys()];
const typeOf = (n: string) => published[THEMES[0]][n]?.type ?? "";
const colours = names.filter((n) => typeOf(n) === "color");

const found: { left: string; right: string; segment: string }[] = [];
for (const name of colours) {
  const parts = name.split("-");
  for (const seg of SEGMENTS) {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] !== seg.left) continue;
      const twin = [...parts];
      twin[i] = seg.right;
      if (colours.includes(twin.join("-"))) found.push({ left: name, right: twin.join("-"), segment: seg.id });
    }
  }
}
found.sort((a, b) => (a.left < b.left ? -1 : a.left > b.left ? 1 : 0));

const oppositions = found.map((p, i) => {
  const same = THEMES.every((t) => resolved(t, p.left) === resolved(t, p.right));
  const spec = SPECIMENS.find(([re]) => re.test(p.left));
  if (spec === undefined) throw new Error(`the segment rule admits ${p.left} and no specimen draws it`);
  return {
    id: p.left,
    segment: p.segment,
    family: p.left.split("-")[0],
    left_token: p.left,
    right_token: p.right,
    specimen: spec[1],
    specimen_says: spec[2],
    graded: same ? "false" : "true",
    declined: same
      ? "the two resolve to the same bytes in all fourteen themes, so the ink is not what tells the opposition apart"
      : "",
    pos: i + 1,
  };
});

// --- the pairing roster ----------------------------------------------------

const semantics = names.flatMap((n) => {
  const m = /^bgColor-([A-Za-z0-9]+)-emphasis$/.exec(n);
  return m === null ? [] : [m[1]];
}).sort();

const pairings: Record<string, string | number | boolean>[] = [];
for (const sem of semantics) {
  pairings.push({
    id: `emphasis-${sem}`, ground_token: `bgColor-${sem}-emphasis`, ink_token: "fgColor-onEmphasis",
    semantic: sem, klass: "text", threshold_filed: 450, ambiguous: "false", pos: pairings.length + 1,
  });
}
for (const sem of semantics) {
  const g = `bgColor-${sem}-muted`, ink = `fgColor-${sem}`;
  if (!DECLS.get(THEMES[0])!.has(g)) throw new Error(`${sem} has an emphasis ground and no muted one`);
  if (!DECLS.get(THEMES[0])!.has(ink)) throw new Error(`${sem} has a muted ground and no semantic ink`);
  pairings.push({
    id: `muted-${sem}`, ground_token: g, ink_token: ink,
    semantic: sem, klass: "text", threshold_filed: 450, ambiguous: "true", pos: pairings.length + 1,
  });
}
pairings.push({
  id: "default-default", ground_token: "bgColor-default", ink_token: "fgColor-default",
  semantic: "default", klass: "text", threshold_filed: 450, ambiguous: "false", pos: pairings.length + 1,
});
pairings.push({
  id: "muted-default", ground_token: "bgColor-muted", ink_token: "fgColor-default",
  semantic: "muted", klass: "text", threshold_filed: 450, ambiguous: "false", pos: pairings.length + 1,
});

// --- the token closure -----------------------------------------------------

const NOMINATED = "light";
const seeds = new Set<string>(["bgColor-default"]);
for (const o of oppositions) {
  seeds.add(o.left_token);
  seeds.add(o.right_token);
}
for (const p of pairings) {
  seeds.add(String(p.ground_token));
  seeds.add(String(p.ink_token));
}
const chartSlots = names.filter((n) => /^data-[a-z]+-color-(emphasis|muted)$/.test(n)).sort();
for (const s of chartSlots) seeds.add(s);
const reachedNames = new Set<string>(seeds);
for (const t of THEMES) for (const s of seeds) for (const step of walk(t, s)) reachedNames.add(step);
const reached = [...reachedNames].sort();

const tokens: Record<string, string | number | boolean>[] = [];
for (const theme of THEMES) {
  const held = theme === NOMINATED ? [...DECLS.get(theme)!.keys()].sort() : reached;
  for (const name of held) {
    const raw = DECLS.get(theme)!.get(name)!;
    const target = aliased(raw);
    const chain = walk(theme, name);
    const value = resolved(theme, name);
    const type = typeOf(name);
    tokens.push({
      id: `${theme}#${name}`,
      theme,
      name,
      raw,
      kind: target === "" ? "literal" : "alias",
      target,
      chain: chain.join(" → "),
      resolved: value,
      composited: type === "color" ? over(value, GROUND_OF.get(theme)!) : "",
      type,
      describes: published[theme][name]?.describes ?? "",
      pos: tokens.length + 1,
    });
  }
}

// --- the rest of the seed --------------------------------------------------

const themes = THEMES.map((t, i) => ({
  id: t,
  ground: ground(t),
  reader: reader(t),
  contrast: contrast(t),
  base: base(t),
  wearable: wearable(t) ? "true" : "false",
  // The theme on the other ground with the same reader and contrast, where one
  // exists. Two of the fourteen have none, and no light half is invented for
  // them: the asymmetry is a row.
  twin: twinOf(t) ?? "",
  // The pair this app wears is the one its own audit recommends, on the audit's
  // own criterion: fewest readings below the floor across the three simulations,
  // summed over the two grounds. That is the colorblind HIGH-CONTRAST pair at
  // thirteen, against twenty for the tritanopia pair and twenty-two for the
  // colorblind pair at normal contrast. The app follows its own number rather
  // than the family name — which is the whole of why it computes one.
  wears: t === "light-colorblind-high-contrast" ? "light" : t === "dark-colorblind-high-contrast" ? "dark" : "",
  ...worn(t),
  pos: i + 1,
}));

const cells: Record<string, string>[] = [];
for (const g of GROUNDS) {
  for (const r of READERS) {
    for (const c of CONTRASTS) {
      const t = THEMES.find((x) => ground(x) === g && reader(x) === r && contrast(x) === c) ?? "";
      cells.push({ id: `${g}/${r}/${c}`, ground: g, reader: r, contrast: c, theme: t, published: t !== "" ? "true" : "false" });
    }
  }
}

// Machado, Oliveira & Fernandes (2009), severity 1.0. The coefficients travel as
// integers at MILLIONTHS, which is exactly the precision the paper publishes, so
// dividing one by a million lands on the same double the decimal literal does.
// Ten-thousandths would not: it rounds 0.367322 to 0.3673, and the two routes
// would then be multiplying by two different matrices and disagreeing in the last
// digit.
const MACHADO: Record<string, number[][]> = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const CITATION = "Machado, G. M., Oliveira, M. M. and Fernandes, L. A. F. (2009), A Physiologically-based Model for Simulation of Color Vision Deficiency, IEEE Transactions on Visualization and Computer Graphics 15(6)";
const mil = (m: number[][]) => {
  const o: Record<string, number> = {};
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[`m${i}${j}`] = Math.round(m[i][j] * 1000000);
  return o;
};
const identity = mil([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);

const readers = [
  {
    id: "trichromat", name: "Trichromat", severity: "none",
    says: "full colour vision — the only reading on any screen that is not a simulation",
    citation: "", pos: 1, ...identity,
  },
  {
    id: "protanopia", name: "Protanopia", severity: "1.0",
    says: "no long-wavelength cone, so red and green collapse toward one another",
    citation: CITATION, pos: 2, ...mil(MACHADO.protan),
  },
  {
    id: "deuteranopia", name: "Deuteranopia", severity: "1.0",
    says: "no medium-wavelength cone; the commoner half of red-green colour blindness",
    citation: CITATION, pos: 3, ...mil(MACHADO.deutan),
  },
  {
    id: "tritanopia", name: "Tritanopia", severity: "1.0",
    says: "no short-wavelength cone, so blue and yellow collapse toward one another",
    citation: CITATION, pos: 4, ...mil(MACHADO.tritan),
  },
];

const floors = [
  { id: "cvd-target", value: 800, applies: "separation", source: "the palette validator's CVD_TARGET", says: "the separation a categorical pair aims for through a dichromat's eyes", pos: 1 },
  { id: "cvd-floor", value: 600, applies: "separation", source: "the palette validator's CVD_FLOOR", says: "below this a dichromat cannot tell the pair apart, and the validator fails the palette outright", pos: 2 },
  { id: "normal-floor", value: 1500, applies: "separation", source: "the palette validator's NORMAL_FLOOR", says: "the separation a pair owes a reader with full colour vision", pos: 3 },
  { id: "wcag-text", value: 450, applies: "ratio", source: "Primer's own published contrast table", says: "4.5:1 — WCAG AA for normal text", pos: 4 },
  { id: "wcag-ui", value: 300, applies: "ratio", source: "Primer's own published contrast table", says: "3:1 — WCAG AA for large text or a user interface component", pos: 5 },
];

// The vendor's claims are quoted from the vendored guide; the platform's are
// unifications `cue` answers. `probe` is empty exactly where the claim is the
// vendor's, because a vendor's sentence is quoted rather than measured.
const GUIDE = read("DESIGN_TOKENS_GUIDE.md");
const quote = (from: string, to: string) => {
  const a = GUIDE.indexOf(from);
  if (a < 0) throw new Error(`the guide does not carry ${JSON.stringify(from)}`);
  const b = GUIDE.indexOf(to, a);
  if (b < 0) throw new Error(`the guide does not carry ${JSON.stringify(to)} after it`);
  return GUIDE.slice(a, b + to.length).trimEnd();
};

const claims = [
  {
    id: "claim-theme-names", kind: "theme-name",
    says: "light-colorblind, dark-colorblind, light-tritanopia and dark-tritanopia, and their high-contrast siblings: six of the fourteen theme file names name a reader.",
    reads: "A theme named for a reader is a claim about that reader's ability to tell the system's semantic oppositions apart. The audit computes that separation for every theme and every reader.",
    departs: "the vendor states the claim in a file name and publishes no number for it",
    probe: "", pos: 1,
  },
  {
    id: "claim-pairing-rule", kind: "pairing-rule",
    says: quote("| Background Token", "| NEVER use `fgColor-muted` |"),
    reads: "Twenty-six obligations per theme: each of the twelve emphasis grounds under the onEmphasis ink, each muted ground under its own semantic ink, and the two default-ground rows.",
    departs: "none — the roster is the matrix",
    probe: "", pos: 2,
  },
  {
    id: "claim-thresholds", kind: "threshold",
    says: quote("| Context ", "| 3:1   | WCAG AA  |"),
    reads: "Every pairing carries a verdict against 4.5:1 and a verdict against 3:1.",
    departs: "the tokens do not say which row of the table a muted ground under semantic ink belongs to, so both verdicts are printed and the ambiguity is a stated departure rather than a choice",
    probe: "", pos: 3,
  },
  {
    id: "claim-core-rule", kind: "pairing-rule",
    says: quote("**You are a CSS expert.", "Only use semantic tokens.**"),
    reads: "No stylesheet in this app holds a colour literal; every specimen is painted from a Token row through a bound inline custom property. The platform's literal lint is what holds it.",
    departs: "none — the platform refuses the literal the guide asks nobody to write",
    probe: "deno run plugins/pronto/check-facts.ts (the literal rule over this app's stylesheets)",
    pos: 4,
  },
];

// --- write -----------------------------------------------------------------

const write = (name: string, rows: unknown[]) => {
  Deno.writeTextFileSync(new URL(name, OUT), JSON.stringify(rows) + "\n");
  console.error(`${name}: ${rows.length} rows`);
};

write("themes.json", themes);
write("cells.json", cells);
write("segments.json", SEGMENTS);
write("readers.json", readers);
write("floors.json", floors);
write("tokens.json", tokens);
write("oppositions.json", oppositions);
write("pairings.json", pairings);
write("claims.json", claims);
