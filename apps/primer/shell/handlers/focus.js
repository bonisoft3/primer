// focus — which of the four readings the specimens on the audit screen wear.
//
// A separate seat from `audit`, and for the same reason plausible splits its two:
// this one depends on the cursor and on nothing else, so moving the reader
// repaints the specimens without re-folding a thousand separations. It owns
// `Reading.painted` and writes no other column.

const txt = (v) => String(v === undefined || v === null ? "" : v);

(state, event) => {
  const rows = state.rows ?? {};
  const cursor = (rows.cursor ?? [])[0];
  const readings = rows.reading ?? [];
  if (cursor === undefined || readings.length === 0) return { updates: [] };
  const wanted = txt(cursor.reader);
  const updates = [];
  for (let i = 0; i < readings.length; i++) {
    const r = readings[i];
    const on = txt(r.reader) === wanted ? "yes" : "no";
    if (txt(r.painted) === on) continue;
    updates.push({ op: "patch", entity: "reading", id: r.id, row: { painted: on } });
  }
  return { updates: updates };
};
