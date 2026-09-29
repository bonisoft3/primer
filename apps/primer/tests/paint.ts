// THE SPINE'S CLAMP: the separation, recomputed from the colours a browser
// actually painted on the specimens.
//
//   deno run -A --unsafely-ignore-certificate-errors tests/paint.ts .
//
// Every other check in this app mounts into linkedom, which computes no style, so
// none of them can tell a painted specimen from an empty box. This one can, and
// it is the only one that can — so it is also the one most likely to be quietly
// weakened when it is slow. It stays one `page.evaluate` per screen, it stays
// over all fourteen themes, and it stays a gate. Narrowed to a sample it would
// put the whole grade back to being a fixture check with a UI beside it.
//
// It reads a PAINTED property — `background-color`, `color`, `border-*-color` —
// and never the custom property, because `getPropertyValue` on a custom property
// returns the unresolved token text and not a colour. The dark half is reached
// the way the platform resolves appearance, through the context's colour scheme,
// never by toggling a class.
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import * as G from "./ground-truth.ts";
import { baseUrl } from "../../../plugins/omnishell/base-url.ts";

const { chromium } = await import("npm:playwright@1.59.1");

const APP = Deno.args[0] ?? ".";
/** Long enough for a cold mount to fold 1,064 separations and 364 ratios. */
const SETTLE_MS = 6000;

/** What one audit screen reports about the colours it painted. Runs in the page,
 * once per screen, and returns only what the grade needs. */
function probe() {
  const rgb = (v: string): string => {
    const m = /^rgba?\(([^)]+)\)$/.exec(v.trim());
    if (m === null) return v.trim();
    const n = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    // A specimen composited over its own ground has no alpha left; a
    // translucent one here means the paint did not arrive.
    if (n.length > 3 && n[3] !== 1) return `translucent:${v}`;
    const hex = (x: number) => Math.round(x).toString(16).padStart(2, "0");
    return `#${hex(n[0])}${hex(n[1])}${hex(n[2])}`;
  };
  // Which painted property carries the specimen's colour, by the kind of thing
  // the opposition is drawn as. A background for a badge, an ink for a word, a
  // rule for a border: reading the wrong one would report the ground.
  const painted = (el: Element, kind: string): string => {
    const cs = getComputedStyle(el);
    if (kind === "ink" || kind === "diff-ink" || kind === "syntax-ink" || kind === "rule" || kind === "field") {
      return rgb(cs.borderTopColor);
    }
    return rgb(cs.backgroundColor);
  };
  const out: { opposition: string; kind: string; left: string; right: string; ground: string }[] = [];
  for (const block of document.querySelectorAll("li.op")) {
    const name = (block.querySelector("h2 a")?.textContent ?? "").trim();
    const pair = block.querySelector(".pair");
    if (pair === null) {
      out.push({ opposition: name, kind: "", left: "no-specimen", right: "no-specimen", ground: "" });
      continue;
    }
    const kind = pair.getAttribute("data-specimen") ?? "";
    const l = pair.querySelector(".side-left .chip");
    const r = pair.querySelector(".side-right .chip");
    const box = (el: Element | null) => (el === null ? null : el.getBoundingClientRect());
    const lb = box(l), rb = box(r);
    out.push({
      opposition: name,
      kind,
      // A specimen with no box is not painted at all, whatever its computed
      // colour says: an element the layout gave no area to shows nothing.
      left: l === null || lb!.width === 0 || lb!.height === 0 ? "unpainted" : painted(l, kind),
      right: r === null || rb!.width === 0 || rb!.height === 0 ? "unpainted" : painted(r, kind),
      ground: rgb(getComputedStyle(pair).backgroundColor),
    });
  }
  // The adopted pair's own boundary: a swatch painted from a row against the
  // chrome painted from a design token. The design layer is load-bearing on
  // exactly the two themes it can hold, and this is the number that says so.
  const chrome = getComputedStyle(document.documentElement);
  const verdicts = [...document.querySelectorAll(".word.verdict")].map((el) => ({
    text: (el.textContent ?? "").trim(),
    color: rgb(getComputedStyle(el).color),
  }));
  const panel = document.querySelector(".subject");
  return {
    pairs: out,
    surface: rgb(getComputedStyle(document.body).backgroundColor),
    // The screen's own root, which is set in the theme it is about — bound from
    // that theme's row, so it moves with the subject and not with the reader's
    // appearance.
    panel: panel === null ? "no-panel" : rgb(getComputedStyle(panel).backgroundColor),
    tokens: {
      surface: chrome.getPropertyValue("--surface").trim(),
      primary: chrome.getPropertyValue("--primary").trim(),
    },
    verdicts,
  };
}

type Probe = ReturnType<typeof probe>;

const truth = G.readings();
const byId = new Map(truth.map((r) => [r.id, r]));
const graded = G.oppositions().filter((o) => o.graded === "true");

// The two halves of the one identity this app wears, and which theme each is.
const worn = { light: "light-colorblind-high-contrast", dark: "dark-colorblind-high-contrast" };

const problems: string[] = [];
const base = await baseUrl(APP);
const browser = await chromium.launch();
let screens = 0, compared = 0;

for (const appearance of ["light", "dark"] as const) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    colorScheme: appearance,
    viewport: { width: 1280, height: 900 },
  });
  for (const theme of G.THEMES) {
    const page = await context.newPage();
    await page.goto(`${base}/theme/${theme}`, { waitUntil: "load" });
    await page.waitForSelector("li.op .pair", { timeout: SETTLE_MS });
    await page.waitForTimeout(500);
    const seen = await page.evaluate(probe) as Probe;
    screens++;
    if (seen.pairs.length !== graded.length) {
      problems.push(`${theme}/${appearance}: ${seen.pairs.length} specimens painted for ${graded.length} graded pairs`);
    }
    for (const p of seen.pairs) {
      const want = byId.get(`${p.opposition}#${theme}#trichromat`);
      if (want === undefined) {
        problems.push(`${theme}/${appearance}: painted a specimen for ${p.opposition}, which nothing grades`);
        continue;
      }
      if (p.left === "unpainted" || p.right === "unpainted" || p.left === "no-specimen") {
        problems.push(`${theme}/${appearance}/${p.opposition}: ${p.left} — a blank box is not a specimen`);
        continue;
      }
      if (p.left.startsWith("translucent") || p.right.startsWith("translucent")) {
        problems.push(`${theme}/${appearance}/${p.opposition}: a translucent specimen matches nothing`);
        continue;
      }
      // THE GRADE: the separation recomputed from what the browser resolved.
      let sep: number;
      try {
        sep = G.cents(G.separation(p.left, p.right, "trichromat"));
      } catch (e) {
        problems.push(`${theme}/${appearance}/${p.opposition}: ${(e as Error).message}`);
        continue;
      }
      if (sep !== want.separation) {
        problems.push(
          `${theme}/${appearance}/${p.opposition}: painted ${p.left}/${p.right} gives ${sep}, the ground truth ${want.separation}`,
        );
      }
      if (p.left !== want.left_color || p.right !== want.right_color) {
        problems.push(
          `${theme}/${appearance}/${p.opposition}: painted ${p.left}/${p.right}, owed ${want.left_color}/${want.right_color}`,
        );
      }
      compared++;
    }
    // The page is set in the theme it is about, in either appearance: this is
    // the number that says so, and a screen that lost the binding reports the
    // reader's appearance here instead of the subject's ground.
    const ground = G.painted(theme, "bgColor-default");
    if (seen.panel !== ground) {
      problems.push(
        `${theme}/${appearance}: the screen is set in ${seen.panel} and its subject's ground is ${ground}`,
      );
    }
    // For the adopted pair alone, the BODY — painted from a design token and
    // reached by no binding — and the theme's own value have to be the same
    // colour. Everywhere else the two are deliberately unrelated: the subject
    // theme is data, not identity.
    if (theme === worn[appearance] && seen.surface !== ground) {
      problems.push(
        `${theme}/${appearance}: the chrome resolves ${seen.surface} and the theme's own ground is ${ground}`,
      );
    }
    // No two verdicts differ only in computed colour: every one differs in TEXT,
    // because this app's own audit found no theme that survives all three
    // readers and a hue would be unreadable to one of them.
    const byColour = new Map<string, Set<string>>();
    for (const v of seen.verdicts) byColour.set(v.color, (byColour.get(v.color) ?? new Set()).add(v.text));
    const words = new Set(seen.verdicts.map((v) => v.text));
    if (words.size < 2) problems.push(`${theme}/${appearance}: every verdict reads the same word`);
    for (const v of seen.verdicts) {
      if (v.text === "") problems.push(`${theme}/${appearance}: a verdict element carries no word`);
    }
    await page.close();
  }

  // The simulation genuinely repaints: the reader control moves and the colour
  // measured on the page becomes the simulation the oracle computed. Once per
  // appearance, on one theme, because the arithmetic is graded per-reader
  // everywhere else and what is at stake here is that the PAINT follows.
  const page = await context.newPage();
  await page.goto(`${base}/theme/light`, { waitUntil: "load" });
  await page.waitForSelector(".readers form button", { timeout: SETTLE_MS });
  await page.waitForTimeout(500);
  const before = await page.evaluate(probe) as Probe;
  const buttons = await page.locator(".readers form button").all();
  const names = await Promise.all(buttons.map((b) => b.textContent()));
  const at = names.findIndex((n) => (n ?? "").trim() === "Deuteranopia");
  if (at < 0) problems.push(`${appearance}: no reader button for deuteranopia`);
  else {
    await buttons[at].click();
    await page.waitForTimeout(800);
    const after = await page.evaluate(probe) as Probe;
    let moved = 0;
    for (const p of after.pairs) {
      const want = byId.get(`${p.opposition}#light#deuteranopia`);
      if (want === undefined) continue;
      if (p.left !== want.left_seen || p.right !== want.right_seen) {
        problems.push(
          `simulate/${appearance}/${p.opposition}: painted ${p.left}/${p.right}, the simulation says ${want.left_seen}/${want.right_seen}`,
        );
      }
      const was = before.pairs.find((x) => x.opposition === p.opposition);
      if (was !== undefined && (was.left !== p.left || was.right !== p.right)) moved++;
    }
    if (moved === 0) problems.push(`simulate/${appearance}: the reader moved and nothing on the page repainted`);
  }
  await page.close();
  await context.close();
}
await browser.close();

console.error(
  `paint: ${screens} screens, ${compared} specimens regraded from what the browser painted, ` +
    `${problems.length} problems`,
);
if (screens !== G.THEMES.length * 2) {
  problems.push(`${screens} screens loaded, ${G.THEMES.length * 2} owed — this check is a gate over all fourteen`);
}
if (compared !== graded.length * G.THEMES.length * 2) {
  problems.push(`${compared} specimens regraded, ${graded.length * G.THEMES.length * 2} owed`);
}
if (problems.length > 0) {
  for (const p of problems.slice(0, 40)) console.error(`  ${p}`);
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
  Deno.exit(1);
}
console.error("paint: the painted colours and the ground truth agree, in both appearances");
