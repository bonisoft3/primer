// How a test mounts this app and reads what it shows.
//
// Shared because a second copy of `empties` is a second answer to "what does a
// cold store hold", and the copy that drifted would mount a warm one while
// reporting green.

import {
  appCollections,
  appSeed,
  type El,
  type Mounted,
  mountApp,
  type Row,
} from "../../../plugins/omnishell/test/screen-harness.ts";
import { APP } from "./ground-truth.ts";

export const txt = (v: unknown) => String(v ?? "");
export const textOf = (el: El | undefined) => (el?.textContent ?? "").trim();
export const attr = (el: El, name: string) => txt(el.getAttribute(name));

/** The collections the app declares and does not seed, as empty tables. A mount
 * that omits one gets whatever the harness defaults to, which is not a cold
 * store. */
export const empties = async (): Promise<Record<string, Row[]>> => {
  const seeded = new Set(Object.keys(await appSeed(APP)));
  const out: Record<string, Row[]> = {};
  for (const t of await appCollections(APP)) if (!seeded.has(t)) out[t] = [];
  return out;
};

export type Open = { screen: string; params?: Record<string, string> };

/** One settled screen off the cold seed, with no live service anywhere. */
export async function open(spec: Open): Promise<Mounted> {
  const m = await mountApp({ appDir: APP, screen: spec.screen, params: spec.params, tables: await empties(), seed: 1 });
  await m.settle();
  const fold = m.rows("fold").find((r) => txt(r.id) === "audit");
  if (fold === undefined) throw new Error("the seat's own row is not in the store");
  if (txt(fold.error) !== "") throw new Error(`the fold refused: ${txt(fold.error)}`);
  return m;
}

/** Submit one form the way a finger does: the button is inside the form, so the
 * gesture the interpreter hears is the form's own submit. */
export async function submit(m: Mounted, form: El) {
  m.fire(form, "submit");
  await m.settle();
}

/** Move the reader by pressing the picker's own button, which is the only
 * gesture on any screen in this app. */
export async function pickReader(m: Mounted, reader: string) {
  const buttons = m.all(".readers form button");
  const forms = m.all(".readers form");
  const readers = m.rows("reader").slice().sort((a, b) => Number(a.pos) - Number(b.pos));
  const at = readers.findIndex((r) => txt(r.id) === reader);
  if (at < 0) throw new Error(`no Reader row ${reader}`);
  if (buttons.length !== readers.length) {
    throw new Error(`${buttons.length} reader buttons for ${readers.length} Reader rows`);
  }
  await submit(m, forms[at]);
}

/** One row's cells by class, which is how every reader below asks the DOM. A
 * class that names two elements in one row is the row disagreeing with itself,
 * which is a finding rather than something to take the first of. */
export const cells = (li: El, classes: string[]): string[] =>
  classes.map((c) => {
    const found = [...li.querySelectorAll(`.${c}`)];
    if (found.length !== 1) throw new Error(`${found.length} elements of class ${c} in a row, not one`);
    return textOf(found[0]);
  });

/** Every figure and word a rendered reading row carries, read off the DOM rather
 * than off the store: a number the store holds and no screen shows is exactly
 * what the reverse anti-join exists to find. */
export type ShownReading = { reader: string; separation: string; floor: string; verdict: string; delta: string };

export const shownReadings = (m: Mounted, root: string): ShownReading[] =>
  m.all(`${root} li.reading`).map((li) => {
    const [reader, separation, floor, verdict, delta] = cells(li, ["who", "sep", "floor", "verdict", "delta"]);
    return { reader, separation, floor, verdict, delta };
  });
