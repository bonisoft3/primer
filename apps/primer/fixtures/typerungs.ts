// The type-role finding, measured off the EMITTED stylesheet rather than authored.
//
//   deno run --allow-read=.,../../plugins --allow-run=cue --allow-write=fixtures fixtures/typerungs.ts
//
// A role wins its norm (#Design.type in schema.cue says why), so every purpose
// whose value coincides with a vendored step drops that step from what this app's
// literal lint can name. Written by hand the count drifts on the first
// value change, and the finding it carries becomes a sentence nobody can check —
// so it is read off shell/design.css and off `cue export` of the scale, and
// `tests/coverage.test.ts` re-reads both and holds these rows to them.

const APP = new URL("../", import.meta.url);
const ROOT = new URL("../../", APP);

const css = Deno.readTextFileSync(new URL("shell/design.css", APP));
const roles = new Map<string, string>();
for (const m of css.matchAll(/^\s*--type-([A-Za-z0-9-]+):\s*([^;]+);/gm)) roles.set(m[1], m[2].trim());
if (roles.size === 0) throw new Error("shell/design.css declares no --type-* role");

// One level of indirection, which is the only shape a role may alias: "the same
// value as that purpose".
const value = (v: string): string => {
  const m = /^var\(--type-([A-Za-z0-9-]+)\)$/.exec(v);
  if (m === null) return v;
  const target = roles.get(m[1]);
  if (target === undefined) throw new Error(`--type-${m[1]} is aliased and not declared`);
  return value(target);
};

const scale = async (bucket: string) => {
  const p = await new Deno.Command("cue", {
    args: ["export", "plugins/pronto/schema.cue", "plugins/pronto/types.cue", "-e", `#scale.buckets.${bucket}`, "--out", "json"],
    cwd: ROOT.pathname,
    stdout: "piped",
    stderr: "inherit",
  }).output();
  if (!p.success) throw new Error(`cue could not export the ${bucket} bucket`);
  return JSON.parse(new TextDecoder().decode(p.stdout)) as { prefix: string; steps: Record<string, string> };
};

const text = await scale("text");
const leading = await scale("leading");

// A key spelled leading-* is a line-height and any other is a font size
// (#Design.type in schema.cue).
const rows = [...roles.keys()].sort().map((purpose, i) => {
  const bucket = purpose.startsWith("leading-") ? leading : text;
  const v = value(roles.get(purpose)!);
  const step = Object.entries(bucket.steps).find(([, sv]) => sv === v);
  return {
    id: purpose,
    purpose,
    value: roles.get(purpose)!,
    resolved: v,
    dimension: purpose.startsWith("leading-") ? "leading" : "text",
    coincides: step === undefined ? "" : `${bucket.prefix}${step[0]}`,
    pos: i + 1,
  };
});

const shadowed = new Set(rows.filter((r) => r.coincides !== "").map((r) => r.coincides));
const steps = Object.keys(text.steps).length + Object.keys(leading.steps).length;
console.error(
  `${rows.length} purposes; ${shadowed.size} of the ${steps} vendored steps shadowed, ` +
    `${rows.filter((r) => r.coincides === "").length} purposes the ladders have no step for`,
);
Deno.writeTextFileSync(new URL("typerungs.json", import.meta.url), JSON.stringify(rows) + "\n");
