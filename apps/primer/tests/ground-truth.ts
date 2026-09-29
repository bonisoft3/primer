// The independent route. Every number this app prints is answered here, from the
// vendored tarball's own bytes, and nothing below reads the app.
//
// The app computes the same separations in a Jessie reduce over rows in the tab
// (shell/handlers/audit.js). Two implementations of colour-vision simulation
// agreeing is the grade; a shared helper would make it a tautology, so this file
// and that one share no code and are written from the published model rather than
// from each other.

export const APP = new URL("../", import.meta.url);
const VENDOR = new URL("../fixtures/primer-primitives-11.10.0/", import.meta.url);

/** The roster is the tarball's directory listing, ordered by ground then by
 * reader then by contrast — so adding a theme grows every denominator with no
 * edit here. */
export const THEMES: string[] = (() => {
  const stems = [...Deno.readDirSync(new URL("themes/", VENDOR))]
    .filter((e) => e.isFile && e.name.endsWith(".css"))
    .map((e) => e.name.slice(0, -".css".length));
  const rank = (t: string) => [
    groundOf(t) === "light" ? 0 : groundOf(t) === "dark" ? 1 : 2,
    readerOf(t) === "trichromat" ? 0 : readerOf(t) === "red-green" ? 1 : 2,
    contrastOf(t) === "normal" ? 0 : 1,
  ];
  return stems.sort((a, b) => {
    const [x, y] = [rank(a), rank(b)];
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
    return a < b ? -1 : 1;
  });
})();

/** A theme's three axes, read off its name. Primer's naming IS the claim this
 * app audits, so the axes are parsed from it rather than tabulated beside it. */
export function groundOf(theme: string): string {
  return theme.startsWith("dark-dimmed") ? "dark-dimmed" : theme.startsWith("dark") ? "dark" : "light";
}
export function readerOf(theme: string): string {
  if (theme.includes("colorblind")) return "red-green";
  if (theme.includes("tritanopia")) return "tritanopia";
  return "trichromat";
}
export function contrastOf(theme: string): string {
  return theme.endsWith("high-contrast") ? "high" : "normal";
}
/** The trichromat-normal member of a theme's own ground: the theme every
 * variant's delta is measured against. */
export function baseOf(theme: string): string {
  const g = groundOf(theme);
  const found = THEMES.find((t) => groundOf(t) === g && readerOf(t) === "trichromat" && contrastOf(t) === "normal");
  if (found === undefined) throw new Error(`no trichromat-normal theme on the ${g} ground`);
  return found;
}
/** The theme on the other wearable ground with this one's reader and contrast,
 * if the vendor ships one: the other half of a pronto identity. Symmetric
 * between light and dark; the dimmed ground is on neither side, so it has none. */
export function twinOf(theme: string): string | undefined {
  const other = OTHER_GROUND[groundOf(theme)];
  return THEMES.find((x) =>
    groundOf(x) === other && readerOf(x) === readerOf(theme) && contrastOf(x) === contrastOf(theme)
  );
}
const OTHER_GROUND: Record<string, string> = { light: "dark", dark: "light" };

export const GROUNDS = ["light", "dark", "dark-dimmed"];
/** The four readings every graded pair carries: full colour vision, and the
 * three dichromacies Primer's own theme names invoke. */
export const READERS = ["trichromat", "protanopia", "deuteranopia", "tritanopia"];
/** Which reading a theme named for a reader is judged by. `red-green` is the
 * reduction min(protanopia, deuteranopia) the palette validator itself makes,
 * and is a Score key rather than a fourth Reading. */
export const NAMED = ["trichromat", "red-green", "tritanopia"];
export const CONTRASTS = ["normal", "high"];

// --- the stylesheets -------------------------------------------------------

const DECL = /--([A-Za-z0-9-]+):\s*([^;]+);/g;
const AUTO = "@media (prefers-color-scheme: dark)";

/** One theme's declarations. Each file states the same set twice — once under
 * the explicit `data-color-mode` selector and once inside the auto block — and
 * this reads one only after holding the two equal, name for name and byte for
 * byte. A theme where that stopped holding raises: choosing a block silently
 * would be choosing which half of the vendor's file to audit. */
export function declarations(theme: string): Map<string, string> {
  const src = Deno.readTextFileSync(new URL(`themes/${theme}.css`, VENDOR));
  const at = src.indexOf(AUTO);
  if (at < 0) throw new Error(`${theme}.css: no ${AUTO} block`);
  const read = (s: string) => {
    const m = new Map<string, string>();
    DECL.lastIndex = 0;
    for (const d of s.matchAll(DECL)) m.set(d[1], d[2].trim());
    return m;
  };
  const explicit = read(src.slice(src.indexOf("{"), at));
  const auto = read(src.slice(at));
  if (explicit.size !== auto.size) {
    throw new Error(`${theme}.css: ${explicit.size} explicit declarations against ${auto.size} in the auto block`);
  }
  for (const [name, value] of explicit) {
    if (auto.get(name) !== value) {
      throw new Error(`${theme}.css: --${name} is ${value} explicitly and ${auto.get(name)} in the auto block`);
    }
  }
  return explicit;
}

type Published = Record<string, Record<string, { type: string; describes: string }>>;
const published: Published = JSON.parse(Deno.readTextFileSync(new URL("published.json", VENDOR)));

/** Each declaration's published `$type`, from the machine-readable twin. It is
 * identical across all fourteen themes and that is asserted rather than assumed
 * — the audit is a colour audit by the vendor's own construction, and the claim
 * is worth going red on. */
export function types(): Map<string, string> {
  const first = published[THEMES[0]];
  for (const t of THEMES.slice(1)) {
    for (const [name, row] of Object.entries(first)) {
      if (published[t][name]?.type !== row.type) {
        throw new Error(`--${name} is ${row.type} in ${THEMES[0]} and ${published[t][name]?.type} in ${t}`);
      }
    }
  }
  return new Map(Object.entries(first).map(([n, r]) => [n, r.type]));
}
export function describes(theme: string, name: string): string {
  return published[theme][name]?.describes ?? "";
}

const VAR = /^var\(--([A-Za-z0-9-]+)(?:\s*,.*)?\)$/;

/** Whether a declaration holds a value or names another token. */
export function kindOf(value: string): "literal" | "alias" {
  return VAR.test(value.trim()) ? "alias" : "literal";
}
export function targetOf(value: string): string {
  return VAR.exec(value.trim())?.[1] ?? "";
}

/** The chain a token resolves through, WITHIN ITS OWN THEME. Twenty tokens are
 * an alias in all fourteen and retarget between them, so a resolver that reached
 * across themes would read a plausible wrong colour with nothing red. */
export function chain(decls: Map<string, string>, name: string): string[] {
  const seen: string[] = [];
  let cur = name;
  for (;;) {
    if (seen.includes(cur)) throw new Error(`alias cycle: ${seen.join(" → ")} → ${cur}`);
    seen.push(cur);
    const v = decls.get(cur);
    if (v === undefined) throw new Error(`--${cur} is named and never declared`);
    if (kindOf(v) === "literal") return seen;
    cur = targetOf(v);
  }
}
export function resolve(decls: Map<string, string>, name: string): string {
  const walk = chain(decls, name);
  return decls.get(walk[walk.length - 1])!;
}

// --- colour ----------------------------------------------------------------

const HEX = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/;

export function rgba(value: string): [number, number, number, number] {
  const m = HEX.exec(value.trim());
  if (m === null) throw new Error(`not a hex colour: ${value}`);
  const c = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  return [c[0], c[1], c[2], m[2] === undefined ? 1 : parseInt(m[2], 16) / 255];
}

const byte = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, "0");

/** Every colour composited over its own theme's ground before it is measured.
 * Roughly an eighth of the resolved declarations carry alpha, and the vendored
 * validator's hex reader drops the fourth byte inside the exported function, so
 * a separation computed on the first six digits is a wrong number that looks
 * right. The ground is a row on the screen rather than a constant. */
export function composite(value: string, ground: string): string {
  const c = rgba(value);
  const g = rgba(ground);
  if (g[3] !== 1) throw new Error(`the compositing ground is translucent: ${ground}`);
  if (c[3] === 1) return `#${byte(c[0])}${byte(c[1])}${byte(c[2])}`;
  const out = [0, 1, 2].map((i) => c[i] * c[3] + g[i] * (1 - c[3]));
  return `#${byte(out[0])}${byte(out[1])}${byte(out[2])}`;
}

/** Machado, Oliveira & Fernandes (2009) at severity 1.0, in linear RGB. The
 * numbers are the published model's, and they are also what the vendored
 * validator's private copy holds — which `fixture` pins through validate()'s
 * public report rather than by importing them. */
/** One severity, stated. The model supports anomalous trichromacy at partial
 * severity; a dial would turn a verdict into a slider, and the floors this
 * repository settled are for full severity. */
export const SEVERITY: Record<string, string> = {
  trichromat: "none",
  protanopia: "1.0",
  deuteranopia: "1.0",
  tritanopia: "1.0",
};

export const MACHADO: Record<string, number[][]> = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};

const s2lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linear = (hex: string) => rgba(hex).slice(0, 3).map(s2lin);

function oklab([r, g, b]: number[]): number[] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

const KIND: Record<string, string | null> = {
  trichromat: null,
  protanopia: "protan",
  deuteranopia: "deutan",
  tritanopia: "tritan",
};

function seen(hex: string, kind: string | null): number[] {
  const v = linear(hex);
  if (kind === null) return v;
  const M = MACHADO[kind];
  if (M === undefined) throw new Error(`no simulation matrix for ${kind}`);
  return [0, 1, 2].map((i) => Math.max(0, Math.min(1, M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2])));
}

const lin2s = (c: number) => {
  const x = Math.max(0, Math.min(1, c));
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
};

/** The colour as one reader sees it, back in sRGB — what a specimen is actually
 * painted with once the reader control has moved. The trichromat's matrix is the
 * identity, so this is the composited colour itself. */
export function asSeen(hex: string, reader: string): string {
  const kind = reader === "trichromat" ? null : KIND[reader];
  if (kind === undefined) throw new Error(`no such reader: ${reader}`);
  const v = seen(hex, kind).map(lin2s);
  return `#${v.map((c) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, "0")).join("")}`;
}

/** Euclidean OKLab distance ×100, through one reader's eyes. */
export function deltaE(a: string, b: string, kind: string | null): number {
  const [x, y] = [oklab(seen(a, kind)), oklab(seen(b, kind))];
  return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

/** One reading of one pair. `red-green` is min(protanopia, deuteranopia), the
 * reduction the vendored validator itself makes over the two. */
export function separation(left: string, right: string, reader: string): number {
  if (reader === "red-green") {
    return Math.min(separation(left, right, "protanopia"), separation(left, right, "deuteranopia"));
  }
  if (!(reader in KIND)) throw new Error(`no such reader: ${reader}`);
  return deltaE(left, right, KIND[reader]);
}

/** The app's stated precision: every separation is an integer at hundredths, so
 * the two routes agree exactly or they disagree. A float column would put a
 * rounding argument between them. */
export const cents = (x: number) => Math.round(x * 100);

// --- the floors ------------------------------------------------------------

/** The thresholds, each as the row it is on the specification screen. The two
 * separation numbers are this repository's settled ones for categorical
 * palettes; the two ratios are Primer's own published table. */
export const FLOORS = [
  {
    id: "cvd-target",
    value: 800,
    applies: "separation",
    source: "the palette validator's CVD_TARGET",
    says: "the separation a categorical pair aims for through a dichromat's eyes",
  },
  {
    id: "cvd-floor",
    value: 600,
    applies: "separation",
    source: "the palette validator's CVD_FLOOR",
    says: "below this a dichromat cannot tell the pair apart, and the validator fails the palette",
  },
  {
    id: "normal-floor",
    value: 1500,
    applies: "separation",
    source: "the palette validator's NORMAL_FLOOR",
    says: "the separation a pair owes a reader with full colour vision",
  },
  {
    id: "wcag-text",
    value: 450,
    applies: "ratio",
    source: "Primer's published contrast table, normal text",
    says: "4.5:1, WCAG AA for normal text",
  },
  {
    id: "wcag-ui",
    value: 300,
    applies: "ratio",
    source: "Primer's published contrast table, large text and interface components",
    says: "3:1, WCAG AA for large text or a user interface component",
  },
];

/** Which floor a reading is held to: the dichromats are gated at the validator's
 * hard floor, the trichromat at its normal-vision floor. */
export function floorFor(reader: string): number {
  return reader === "trichromat" ? 1500 : 600;
}

// --- the oppositions -------------------------------------------------------

/** The vendor's own opposition vocabulary. A pair is a pair because its two
 * names differ in exactly one segment and that segment is drawn from here. */
export const SEGMENTS = [
  {
    id: "success-danger",
    left: "success",
    right: "danger",
    says: "a check that passed against one that failed",
    pos: 1,
  },
  { id: "open-closed", left: "open", right: "closed", says: "an issue still open against one closed", pos: 2 },
  {
    id: "inserted-deleted",
    left: "inserted",
    right: "deleted",
    says: "a line a patch adds against one it removes, in highlighted source",
    pos: 3,
  },
  {
    id: "additionLine-deletionLine",
    left: "additionLine",
    right: "deletionLine",
    says: "a whole added line of a diff against a removed one",
    pos: 4,
  },
  {
    id: "additionNum-deletionNum",
    left: "additionNum",
    right: "deletionNum",
    says: "the line number beside an addition against the one beside a deletion",
    pos: 5,
  },
  {
    id: "additionWord-deletionWord",
    left: "additionWord",
    right: "deletionWord",
    says: "the changed words inside an added line against those inside a removed one",
    pos: 6,
  },
];

/** Which pair of interface elements an opposition family is drawn as. Keyed by
 * the token family, because that is what decides what the two colours ARE on a
 * page: a background, an ink, a rule. */
const SPECIMENS: [RegExp, string, string][] = [
  [/^bgColor-.*-emphasis$/, "badge-solid", "two solid state badges"],
  [/^bgColor-.*-muted$/, "badge-soft", "two soft state badges"],
  [/^borderColor-|^border-/, "rule", "two bordered chips"],
  [/^fgColor-/, "ink", "two words of state text"],
  [/^progressBar-/, "meter", "two meter fills"],
  [/^control-borderColor-/, "field", "two field outlines"],
  [/^diffBlob-.*Line-bgColor$/, "diff-line", "an added diff line beside a removed one"],
  [/^diffBlob-.*Num-bgColor$/, "diff-gutter", "an added line number beside a removed one"],
  [/^diffBlob-.*Word-bgColor$/, "diff-word", "changed words inside an added line beside a removed one"],
  [/^diffBlob-.*-fgColor$/, "diff-ink", "the ink of an added line beside that of a removed one"],
  [/prettylights-syntax-markup-.*-bg$/, "syntax-line", "a highlighted added line beside a removed one"],
  [/prettylights-syntax-markup-.*-text$/, "syntax-ink", "highlighted added source beside removed source"],
];

export type Opposition = {
  id: string;
  segment: string;
  family: string;
  left_token: string;
  right_token: string;
  specimen: string;
  specimen_says: string;
  graded: string;
  declined: string;
  pos: number;
};

/** The pair roster, derived by the one stated rule. Nothing is hand-listed: add
 * a segment or a theme and the denominator grows. */
export function oppositions(): Opposition[] {
  const decls = new Map(THEMES.map((t) => [t, declarations(t)]));
  const kind = types();
  const colours = [...decls.get(THEMES[0])!.keys()].filter((n) => kind.get(n) === "color");
  const found: { left: string; right: string; segment: string }[] = [];
  for (const name of colours) {
    const parts = name.split("-");
    for (const seg of SEGMENTS) {
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] !== seg.left) continue;
        const twin = [...parts];
        twin[i] = seg.right;
        const other = twin.join("-");
        if (colours.includes(other)) found.push({ left: name, right: other, segment: seg.id });
      }
    }
  }
  found.sort((a, b) => (a.left < b.left ? -1 : a.left > b.left ? 1 : 0));
  return found.map((p, i) => {
    // A pair whose two members resolve to the same bytes in every theme is not a
    // discriminator: the ground carries that opposition and the ink does not.
    const same = THEMES.every((t) => resolve(decls.get(t)!, p.left) === resolve(decls.get(t)!, p.right));
    const spec = SPECIMENS.find(([re]) => re.test(p.left));
    if (spec === undefined) throw new Error(`no specimen for ${p.left}: the segment rule admits a pair nothing draws`);
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
}

// --- the pairings ----------------------------------------------------------

/** The twelve emphasis semantics, read off the declarations rather than listed:
 * a semantic is one that has an emphasis ground. */
export function semantics(): string[] {
  const decls = declarations(THEMES[0]);
  const out: string[] = [];
  for (const name of decls.keys()) {
    const m = /^bgColor-([A-Za-z0-9]+)-emphasis$/.exec(name);
    if (m !== null) out.push(m[1]);
  }
  return out.sort();
}

export type Pairing = {
  id: string;
  ground_token: string;
  ink_token: string;
  semantic: string;
  klass: string;
  threshold_filed: number;
  ambiguous: string;
  pos: number;
};

/** Primer's published Logic Matrix as rows. Every emphasis ground under
 * onEmphasis ink, every muted ground under its own semantic ink, and the two
 * default-ground rows the matrix names. A semantic with no muted ground or no
 * semantic ink would make an obligation unsatisfiable, so that is checked. */
export function pairings(): Pairing[] {
  const decls = declarations(THEMES[0]);
  const rows: Omit<Pairing, "pos">[] = [];
  for (const sem of semantics()) {
    rows.push({
      id: `emphasis-${sem}`,
      ground_token: `bgColor-${sem}-emphasis`,
      ink_token: "fgColor-onEmphasis",
      semantic: sem,
      klass: "text",
      threshold_filed: 450,
      ambiguous: "false",
    });
  }
  for (const sem of semantics()) {
    const ground = `bgColor-${sem}-muted`;
    const ink = `fgColor-${sem}`;
    if (!decls.has(ground)) throw new Error(`${sem} has an emphasis ground and no muted one`);
    if (!decls.has(ink)) throw new Error(`${sem} has a muted ground and no semantic ink`);
    rows.push({
      id: `muted-${sem}`,
      ground_token: ground,
      ink_token: ink,
      semantic: sem,
      klass: "text",
      threshold_filed: 450,
      // A muted ground under semantic ink is either normal text at 4.5:1 or an
      // interface component at 3:1, and the tokens do not say which. Both
      // verdicts are printed; picking one would turn a measurement into an
      // opinion.
      ambiguous: "true",
    });
  }
  rows.push({
    id: "default-default",
    ground_token: "bgColor-default",
    ink_token: "fgColor-default",
    semantic: "default",
    klass: "text",
    threshold_filed: 450,
    ambiguous: "false",
  });
  rows.push({
    id: "muted-default",
    ground_token: "bgColor-muted",
    ink_token: "fgColor-default",
    semantic: "muted",
    klass: "text",
    threshold_filed: 450,
    ambiguous: "false",
  });
  return rows.map((r, i) => ({ ...r, pos: i + 1 }));
}

// --- the readings ----------------------------------------------------------

export type Reading = {
  id: string;
  opposition: string;
  specimen: string;
  theme: string;
  reader: string;
  left_color: string;
  right_color: string;
  left_seen: string;
  right_seen: string;
  ground: string;
  separation: number;
  floor: number;
  verdict: string;
  delta: number;
};

const state = (() => {
  const decls = new Map(THEMES.map((t) => [t, declarations(t)]));
  const ground = new Map(THEMES.map((t) => [t, resolve(decls.get(t)!, "bgColor-default")]));
  return { decls, ground };
})();

export const declsOf = (theme: string) => state.decls.get(theme)!;
export const groundOfTheme = (theme: string) => state.ground.get(theme)!;

/** One token's painted colour in one theme: resolved in its own theme, then
 * composited over that theme's own default ground. */
export function painted(theme: string, token: string): string {
  return composite(resolve(declsOf(theme), token), groundOfTheme(theme));
}

/** Every graded reading, keyed the way the app keys it. */
export function readings(): Reading[] {
  const ops = oppositions();
  const out: Reading[] = [];
  const sepOf = (theme: string, op: Opposition, reader: string) =>
    cents(separation(painted(theme, op.left_token), painted(theme, op.right_token), reader));
  for (const op of ops) {
    if (op.graded !== "true") continue;
    for (const theme of THEMES) {
      for (const reader of READERS) {
        const sep = sepOf(theme, op, reader);
        const floor = floorFor(reader);
        out.push({
          id: `${op.id}#${theme}#${reader}`,
          opposition: op.id,
          specimen: op.specimen,
          theme,
          reader,
          left_color: painted(theme, op.left_token),
          right_color: painted(theme, op.right_token),
          left_seen: asSeen(painted(theme, op.left_token), reader),
          right_seen: asSeen(painted(theme, op.right_token), reader),
          ground: groundOfTheme(theme),
          separation: sep,
          floor,
          verdict: sep >= floor ? "holds" : "fails",
          delta: sep - sepOf(baseOf(theme), op, reader),
        });
      }
    }
  }
  return out;
}

export type Ratio = {
  id: string;
  pairing: string;
  theme: string;
  ground_color: string;
  ink_color: string;
  ratio: number;
  verdict_text: string;
  verdict_ui: string;
  ambiguous: string;
};

/** WCAG ratios, computed with the vendored validator's own exported
 * `contrast()`. The one arithmetic here that is a call rather than a
 * reimplementation, because the function is public. */
export async function ratios(): Promise<Ratio[]> {
  const { contrast } = await import("../fixtures/vendor/validate_palette.js");
  const out: Ratio[] = [];
  for (const p of pairings()) {
    for (const theme of THEMES) {
      const ground = painted(theme, p.ground_token);
      const ink = painted(theme, p.ink_token);
      const r = cents(contrast(ground, ink) as number);
      out.push({
        id: `${p.id}#${theme}`,
        pairing: p.id,
        theme,
        ground_color: ground,
        ink_color: ink,
        ratio: r,
        verdict_text: r >= 450 ? "holds" : "misses",
        verdict_ui: r >= 300 ? "holds" : "misses",
        ambiguous: p.ambiguous,
      });
    }
  }
  return out;
}

export type Score = {
  id: string;
  theme: string;
  reader: string;
  holds: number;
  fails: number;
  improved: number;
  regressed: number;
  unchanged: number;
};

/** The roster's own column, folded off the readings so the roster's numbers are
 * the readings' and not a second copy — plus the `red-green` reduction, which is
 * the score a theme named for red-green colour blindness is judged by. It is a
 * minimum over two readings rather than a fifth one, and its delta is the
 * minimum's own movement and never the smaller of two movements. */
export function scores(rows: Reading[] = readings()): Score[] {
  const sep = new Map<string, number>();
  for (const r of rows) sep.set(`${r.opposition}#${r.theme}#${r.reader}`, r.separation);
  const worseOf = (op: string, theme: string) =>
    Math.min(sep.get(`${op}#${theme}#protanopia`)!, sep.get(`${op}#${theme}#deuteranopia`)!);
  const reduced: Reading[] = [];
  for (const r of rows) {
    if (r.reader !== "protanopia") continue;
    const mine = worseOf(r.opposition, r.theme);
    reduced.push({
      ...r,
      id: `${r.opposition}#${r.theme}#red-green`,
      reader: "red-green",
      separation: mine,
      verdict: mine >= r.floor ? "holds" : "fails",
      delta: mine - worseOf(r.opposition, baseOf(r.theme)),
    });
  }
  const by = new Map<string, Score>();
  for (const r of [...rows, ...reduced]) {
    const id = `${r.theme}#${r.reader}`;
    const s = by.get(id) ??
      { id, theme: r.theme, reader: r.reader, holds: 0, fails: 0, improved: 0, regressed: 0, unchanged: 0 };
    if (r.verdict === "holds") s.holds++;
    else s.fails++;
    if (r.delta > 0) s.improved++;
    else if (r.delta < 0) s.regressed++;
    else s.unchanged++;
    by.set(id, s);
  }
  return [...by.values()];
}

// --- the census ------------------------------------------------------------

/** The token closure the audit holds, by the stated rule: every token carrying
 * an opposition segment, every token a published pairing names, every
 * categorical chart colour, the whole alias closure of those three, and every
 * declaration of one nominated theme entire. */
export const NOMINATED = "light";

export function chartSlots(): string[] {
  return [...declsOf(THEMES[0]).keys()].filter((n) => /^data-[a-z]+-color-(emphasis|muted)$/.test(n)).sort();
}

/** The names the audit reaches in every theme, before the nominated theme's own
 * whole set is added. Every theme declares the same 959 names, so the closure's
 * cut is in the THEME dimension: `light` entire plus this set in the other
 * thirteen, rather than 959 × 14. */
export function reached(): string[] {
  const seeds = new Set<string>();
  for (const op of oppositions()) {
    seeds.add(op.left_token);
    seeds.add(op.right_token);
  }
  for (const p of pairings()) {
    seeds.add(p.ground_token);
    seeds.add(p.ink_token);
  }
  for (const s of chartSlots()) seeds.add(s);
  seeds.add("bgColor-default");
  const out = new Set<string>(seeds);
  // Every theme's chain, because a token that is a literal in one theme and an
  // alias in another reaches a different target in each.
  for (const theme of THEMES) {
    for (const s of seeds) for (const step of chain(declsOf(theme), s)) out.add(step);
  }
  return [...out].sort();
}

/** The `Token` rows the app holds, as `theme#name`. */
export function closure(): { theme: string; name: string }[] {
  const reach = reached();
  const out: { theme: string; name: string }[] = [];
  for (const theme of THEMES) {
    const names = theme === NOMINATED ? [...declsOf(theme).keys()].sort() : reach;
    for (const name of names) out.push({ theme, name });
  }
  return out;
}

export type Census = { id: string; fact: string; count: number; says: string };

/** Every count is a reduce over THE ROWS THE APP HOLDS, and the fact sentences
 * say so. The app cannot answer a cross-theme question about a name it holds in
 * one theme only, and pretending otherwise is how a declarations screen becomes a
 * claim about a system it does not hold — so the population is `reached()`, the
 * names the closure reaches in every theme, and the oracle counts over the same
 * one. The facts about the whole 959 are graded here, in `census.test.ts`,
 * against the bytes; they are the vendor's and not the app's to print. */
export function census(): Census[] {
  const names = reached();
  const held = closure();
  const invariant = names.filter((n) => THEMES.every((t) => declsOf(t).get(n) === declsOf(THEMES[0]).get(n)));
  const classChangers = names.filter((n) => new Set(THEMES.map((t) => kindOf(declsOf(t).get(n)!))).size > 1);
  const alwaysAlias = names.filter((n) => THEMES.every((t) => kindOf(declsOf(t).get(n)!) === "alias"));
  const retargeting = alwaysAlias.filter((n) => new Set(THEMES.map((t) => targetOf(declsOf(t).get(n)!))).size > 1);
  const grounded = names.filter((n) =>
    GROUNDS.every((g) => new Set(THEMES.filter((t) => groundOf(t) === g).map((t) => resolve(declsOf(t), n))).size === 1)
  );
  const dimmed = names.filter((n) => resolve(declsOf("dark-dimmed"), n) !== resolve(declsOf("dark"), n));
  const alpha = [...declsOf(NOMINATED).keys()].filter((n) => /^#[0-9a-fA-F]{8}$/.test(resolve(declsOf(NOMINATED), n).trim()));
  const slots = chartSlots();
  let worst = Infinity;
  for (const theme of THEMES) {
    const cols = slots.filter((n) => n.endsWith("-emphasis")).map((n) => painted(theme, n));
    for (let i = 0; i < cols.length; i++) {
      for (let j = i + 1; j < cols.length; j++) {
        for (const reader of READERS) worst = Math.min(worst, separation(cols[i], cols[j], reader));
      }
    }
  }
  return [
    {
      id: "declared",
      fact: "declarations this app holds in every one of the fourteen themes",
      count: names.length,
      says: "the closure's own cross-theme population, which is what a cross-theme count below can be asked about",
    },
    {
      id: "held",
      fact: "token rows this app holds",
      count: held.length,
      says: "the stated closure: the opposition members, the pairing members, the chart slots, their alias closures in every theme, and one nominated theme entire",
    },
    {
      id: "invariant",
      fact: "of those, byte-identical in all fourteen",
      count: invariant.length,
      says: "no axis moves these at all",
    },
    {
      id: "ground-only",
      fact: "of those, the reader and contrast axes never move",
      count: grounded.length,
      says: "their resolved value is constant within each ground, so only the ground changes them",
    },
    {
      id: "class-changers",
      fact: "of those, changing value class between themes",
      count: classChangers.length,
      says: "a literal in one theme and an alias in another",
    },
    {
      id: "retargeting",
      fact: "of those, an alias in all fourteen that retargets",
      count: retargeting.length,
      says: "an alias pointing somewhere different depending on the theme, which is why resolution is per-theme",
    },
    {
      id: "alpha",
      fact: "declarations of " + NOMINATED + " that resolve to a translucent colour",
      count: alpha.length,
      says: "each composited over its own theme's default ground before it is measured",
    },
    {
      id: "dimmed-vs-dark",
      fact: "of those held everywhere, differing between the dimmed ground and dark",
      count: dimmed.length,
      says: "the dimmed ground is a third ground and not a variant of dark",
    },
    {
      id: "chart-slots",
      fact: "categorical chart colours",
      count: slots.filter((n) => n.endsWith("-emphasis")).length,
      says: "constant within each ground, so no colorblind or tritanopia theme touches them",
    },
    {
      id: "chart-separation",
      fact: "the worst all-pairs separation among the chart colours, at hundredths",
      count: cents(worst),
      says: "far under every floor in every theme and for every reader, so grading a seventeen-slot categorical set would be vacuous in the other direction",
    },
  ];
}

/** The same counts over the WHOLE published system, which only this route can
 * reach: the app holds one theme entire and the audit's closure elsewhere. These
 * back the language findings, and `census.test.ts` grades them against the bytes
 * rather than against anything the app prints. */
export function corpusCensus() {
  const names = [...declsOf(THEMES[0]).keys()];
  return {
    declared: names.length,
    invariant: names.filter((n) => THEMES.every((t) => declsOf(t).get(n) === declsOf(THEMES[0]).get(n))).length,
    classChangers: names.filter((n) => new Set(THEMES.map((t) => kindOf(declsOf(t).get(n)!))).size > 1).length,
    retargeting: names.filter((n) =>
      THEMES.every((t) => kindOf(declsOf(t).get(n)!) === "alias") &&
      new Set(THEMES.map((t) => targetOf(declsOf(t).get(n)!))).size > 1
    ).length,
    groundOnly: names.filter((n) =>
      GROUNDS.every((g) => new Set(THEMES.filter((t) => groundOf(t) === g).map((t) => resolve(declsOf(t), n))).size === 1)
    ).length,
    dimmedVsDark: names.filter((n) => resolve(declsOf("dark-dimmed"), n) !== resolve(declsOf("dark"), n)).length,
    alphaInNominated: names.filter((n) => /^#[0-9a-fA-F]{8}$/.test(resolve(declsOf(NOMINATED), n).trim())).length,
  };
}
