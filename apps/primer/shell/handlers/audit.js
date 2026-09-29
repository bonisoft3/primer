// audit — the app's own colour-vision arithmetic, over the rows it holds.
//
// Every number any screen prints is written here. `tests/ground-truth.ts`
// answers each one a second time from the vendored bytes, and the two are held
// equal; nothing is shared between the two files, because two implementations of
// the same published model agreeing is the grade.
//
// The one quantity this fold does NOT compute is the compositing: it reads
// `Token.composited`, which the seed carries and the fixture check holds equal to
// the oracle's own compositing of the raw declaration. That is a stated
// departure, not an oversight — a real page composites over whatever is behind,
// and the ground this app measures over is one theme's own default ground, shown
// on the screen as itself.

const txt = (v) => String(v === undefined || v === null ? "" : v);
const num = (v) => (Number(v) || 0);

// --- colour ----------------------------------------------------------------

const chan = (hex, at) => parseInt(hex.slice(at, at + 2), 16) / 255;

// sRGB to linear. A composited value is always six digits, so nothing here has
// an alpha channel to drop.
const s2lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

const linear = (hex) => {
  const h = hex.charAt(0) === "#" ? hex.slice(1) : hex;
  if (h.length !== 6) throw new Error("not a composited six-digit hex: " + hex);
  return [s2lin(chan(h, 0)), s2lin(chan(h, 2)), s2lin(chan(h, 4))];
};

const clamp01 = (c) => (c < 0 ? 0 : c > 1 ? 1 : c);

const oklab = (rgb) => {
  const l = Math.cbrt(0.4122214708 * rgb[0] + 0.5363325363 * rgb[1] + 0.0514459929 * rgb[2]);
  const m = Math.cbrt(0.2119034982 * rgb[0] + 0.6806995451 * rgb[1] + 0.1073969566 * rgb[2]);
  const s = Math.cbrt(0.0883024619 * rgb[0] + 0.2817188376 * rgb[1] + 0.6299787005 * rgb[2]);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
};

// Euclidean OKLab distance ×100, at hundredths as an integer. Math.hypot rather
// than a hand-rolled sqrt of a sum of squares, and 100 × before the rounding
// rather than after: the two routes are held to agree EXACTLY at hundredths, so
// the distance and the scaling are part of the stated arithmetic rather than an
// implementation detail. Written from the vendored validator's own expression;
// the other route is written from the same one, and neither reads the other.
const gap = (a, b, m) => {
  const x = oklab(m === null ? linear(a) : through(linear(a), m));
  const y = oklab(m === null ? linear(b) : through(linear(b), m));
  return Math.round(100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) * 100);
};

// Linear back to sRGB, so a simulated colour is something a specimen can be
// painted with. The reader control repaints the same elements; only this moves.
const lin2s = (c) => {
  const x = clamp01(c);
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
};
const two = (c) => {
  const h = Math.round(clamp01(c) * 255).toString(16);
  return h.length === 1 ? "0" + h : h;
};
const asSeen = (hex, m) => {
  const v = m === null ? linear(hex) : through(linear(hex), m);
  return "#" + two(lin2s(v[0])) + two(lin2s(v[1])) + two(lin2s(v[2]));
};

const relLum = (hex) => {
  const c = linear(hex);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const ratioOf = (a, b) => {
  const x = relLum(a), y = relLum(b);
  const hi = x > y ? x : y, lo = x > y ? y : x;
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100);
};

const through = (rgb, m) => [
  clamp01(m[0] * rgb[0] + m[1] * rgb[1] + m[2] * rgb[2]),
  clamp01(m[3] * rgb[0] + m[4] * rgb[1] + m[5] * rgb[2]),
  clamp01(m[6] * rgb[0] + m[7] * rgb[1] + m[8] * rgb[2]),
];

// The reader's matrix arrives as nine integers at MILLIONTHS off the Reader row,
// so the model is data the specification screen prints rather than a constant
// hidden in this file. Each coefficient is divided BEFORE it multiplies a
// channel, not after the sum: the other route multiplies the published decimals,
// and dividing an exact integer by a million lands on the same double while
// scaling the sum does not. That is the whole of why the two routes agree at
// hundredths.
const MILLION = 1000000;
const matrixOf = (r) => [
  num(r.m00) / MILLION, num(r.m01) / MILLION, num(r.m02) / MILLION,
  num(r.m10) / MILLION, num(r.m11) / MILLION, num(r.m12) / MILLION,
  num(r.m20) / MILLION, num(r.m21) / MILLION, num(r.m22) / MILLION,
];

// --- the fold --------------------------------------------------------------

(state, event) => {
  const rows = state.rows ?? {};

  try {
    const themes = (rows.theme ?? []).slice().sort((a, b) => num(a.pos) - num(b.pos));
    const oppositions = (rows.opposition ?? []).slice().sort((a, b) => num(a.pos) - num(b.pos));
    const readers = (rows.reader ?? []).slice().sort((a, b) => num(a.pos) - num(b.pos));
    const pairings = (rows.pairing ?? []).slice().sort((a, b) => num(a.pos) - num(b.pos));
    const floors = rows.floor ?? [];
    const tokens = rows.token ?? [];
    if (themes.length === 0 || oppositions.length === 0 || tokens.length === 0) return { updates: [] };

    // Every colour this fold measures, keyed theme#name, off the composited
    // column. A missing one raises: reading through a hole would produce a
    // plausible number for a pair the app does not hold.
    const paint = {};
    const groundOf = {};
    for (let i = 0; i < tokens.length; i++) {
      const r = tokens[i];
      paint[txt(r.theme) + "#" + txt(r.name)] = txt(r.composited);
      if (txt(r.name) === "bgColor-default") groundOf[txt(r.theme)] = txt(r.composited);
    }
    const colour = (theme, name) => {
      const v = paint[theme + "#" + name];
      if (v === undefined || v === "") throw new Error("no composited colour for --" + name + " in " + theme);
      return v;
    };

    const floorOf = {};
    for (let i = 0; i < floors.length; i++) floorOf[txt(floors[i].id)] = num(floors[i].value);
    // A trichromat's pair is held to the normal-vision floor and a dichromat's
    // to the validator's hard CVD floor. Both come off Floor rows, so the
    // specification screen shows the number that gated every verdict.
    const held = (readerId) => (readerId === "trichromat" ? floorOf["normal-floor"] : floorOf["cvd-floor"]);

    // The four readings every graded pair carries, off Reader rows — so the
    // model is data the specification screen prints and not a constant hidden
    // in this file. `red-green` is min(protanopia, deuteranopia), the reduction
    // the palette validator itself makes, and it is a Score key rather than a
    // fifth reading.
    const byId = {};
    for (let i = 0; i < readers.length; i++) byId[txt(readers[i].id)] = readers[i];
    const shown = [];
    for (let i = 0; i < readers.length; i++) shown.push(txt(readers[i].id));

    const lens = (readerId) => {
      const r = byId[readerId];
      if (r === undefined) throw new Error("no Reader row " + readerId);
      return readerId === "trichromat" ? null : matrixOf(r);
    };
    const separation = (theme, op, readerId) =>
      gap(colour(theme, txt(op.left_token)), colour(theme, txt(op.right_token)), lens(readerId));

    const baseOf = {};
    for (let i = 0; i < themes.length; i++) baseOf[txt(themes[i].id)] = txt(themes[i].base);

    const readings = [];
    for (let o = 0; o < oppositions.length; o++) {
      const op = oppositions[o];
      if (txt(op.graded) !== "true") continue;
      for (let t = 0; t < themes.length; t++) {
        const theme = txt(themes[t].id);
        for (let r = 0; r < shown.length; r++) {
          const readerId = shown[r];
          const sep = separation(theme, op, readerId);
          const floor = held(readerId);
          readings.push({
            id: txt(op.id) + "#" + theme + "#" + readerId,
            opposition: txt(op.id),
            specimen: txt(op.specimen),
            theme: theme,
            reader: readerId,
            left_color: colour(theme, txt(op.left_token)),
            right_color: colour(theme, txt(op.right_token)),
            left_seen: asSeen(colour(theme, txt(op.left_token)), lens(readerId)),
            right_seen: asSeen(colour(theme, txt(op.right_token)), lens(readerId)),
            ground: groundOf[theme],
            separation: sep,
            floor: floor,
            verdict: sep >= floor ? "holds" : "fails",
            delta: sep - separation(baseOf[theme], op, readerId),
            pos: num(byId[readerId].pos),
          });
        }
      }
    }

    const ratios = [];
    for (let p = 0; p < pairings.length; p++) {
      const pr = pairings[p];
      for (let t = 0; t < themes.length; t++) {
        const theme = txt(themes[t].id);
        const g = colour(theme, txt(pr.ground_token));
        const ink = colour(theme, txt(pr.ink_token));
        const r = ratioOf(g, ink);
        ratios.push({
          id: txt(pr.id) + "#" + theme,
          pairing: txt(pr.id),
          theme: theme,
          ground_color: g,
          ink_color: ink,
          ratio: r,
          verdict_text: r >= floorOf["wcag-text"] ? "holds" : "misses",
          verdict_ui: r >= floorOf["wcag-ui"] ? "holds" : "misses",
          ambiguous: txt(pr.ambiguous),
        });
      }
    }

    // The roster's own column, folded off the readings above so the roster's
    // numbers ARE the readings' and not a second copy of the arithmetic. The
    // `red-green` key is the minimum's own movement and never the smaller of
    // two movements, which is why it is folded from separations rather than
    // from two rows' deltas.
    const sepOf = {};
    for (let i = 0; i < readings.length; i++) {
      const rd = readings[i];
      sepOf[rd.opposition + "#" + rd.theme + "#" + rd.reader] = rd.separation;
    }
    const worseOf = (op, theme) => {
      const p = sepOf[op + "#" + theme + "#protanopia"];
      const d = sepOf[op + "#" + theme + "#deuteranopia"];
      if (p === undefined || d === undefined) throw new Error("no red-green halves for " + op + " in " + theme);
      return p < d ? p : d;
    };
    const reduced = [];
    for (let i = 0; i < readings.length; i++) {
      const rd = readings[i];
      if (rd.reader !== "protanopia") continue;
      const mine = worseOf(rd.opposition, rd.theme);
      reduced.push({
        opposition: rd.opposition,
        theme: rd.theme,
        reader: "red-green",
        separation: mine,
        floor: rd.floor,
        verdict: mine >= rd.floor ? "holds" : "fails",
        delta: mine - worseOf(rd.opposition, baseOf[rd.theme]),
      });
    }
    const scoreBy = {};
    const scores = [];
    const graded = readings.concat(reduced);
    for (let i = 0; i < graded.length; i++) {
      const rd = graded[i];
      const id = rd.theme + "#" + rd.reader;
      let s = scoreBy[id];
      if (s === undefined) {
        s = { id: id, theme: rd.theme, reader: rd.reader, holds: 0, fails: 0, improved: 0, regressed: 0, unchanged: 0 };
        scoreBy[id] = s;
        scores.push(s);
      }
      if (rd.verdict === "holds") s.holds = s.holds + 1;
      else s.fails = s.fails + 1;
      if (rd.delta > 0) s.improved = s.improved + 1;
      else if (rd.delta < 0) s.regressed = s.regressed + 1;
      else s.unchanged = s.unchanged + 1;
    }

    // --- the census, every count a reduce over the rows above ---------------

    const names = {};
    const perTheme = {};
    for (let i = 0; i < tokens.length; i++) {
      const r = tokens[i];
      const name = txt(r.name), theme = txt(r.theme);
      if (perTheme[theme] === undefined) perTheme[theme] = {};
      perTheme[theme][name] = r;
      names[name] = true;
    }
    const themeIds = [];
    for (let t = 0; t < themes.length; t++) themeIds.push(txt(themes[t].id));
    // Only names the app holds in EVERY theme can be asked a cross-theme
    // question; the closure holds the nominated theme's whole set and the
    // reached set elsewhere, and the specification screen says so.
    const everywhere = [];
    for (const name in names) {
      let all = true;
      for (let t = 0; t < themeIds.length; t++) if (perTheme[themeIds[t]][name] === undefined) all = false;
      if (all) everywhere.push(name);
    }
    everywhere.sort();

    let invariant = 0, classChangers = 0, retargeting = 0, groundOnly = 0, alpha = 0, dimmedDiff = 0;
    const groundsOf = {};
    for (let t = 0; t < themes.length; t++) groundsOf[txt(themes[t].id)] = txt(themes[t].ground);
    for (let i = 0; i < everywhere.length; i++) {
      const name = everywhere[i];
      let sameRaw = true, kinds = {}, targets = {}, byGround = {};
      for (let t = 0; t < themeIds.length; t++) {
        const row = perTheme[themeIds[t]][name];
        if (txt(row.raw) !== txt(perTheme[themeIds[0]][name].raw)) sameRaw = false;
        kinds[txt(row.kind)] = true;
        if (txt(row.kind) === "alias") targets[txt(row.target)] = true;
        else targets["#literal"] = true;
        const g = groundsOf[themeIds[t]];
        if (byGround[g] === undefined) byGround[g] = {};
        byGround[g][txt(row.resolved)] = true;
      }
      if (sameRaw) invariant = invariant + 1;
      let nKinds = 0;
      for (const k in kinds) nKinds = nKinds + 1;
      if (nKinds > 1) classChangers = classChangers + 1;
      let nTargets = 0;
      for (const k in targets) nTargets = nTargets + 1;
      if (kinds["literal"] === undefined && nTargets > 1) retargeting = retargeting + 1;
      let constant = true;
      for (const g in byGround) {
        let n = 0;
        for (const v in byGround[g]) n = n + 1;
        if (n > 1) constant = false;
      }
      if (constant) groundOnly = groundOnly + 1;
      if (txt(perTheme["dark-dimmed"][name].resolved) !== txt(perTheme["dark"][name].resolved)) {
        dimmedDiff = dimmedDiff + 1;
      }
    }
    for (let i = 0; i < tokens.length; i++) {
      const r = tokens[i];
      if (txt(r.theme) !== "light") continue;
      const v = txt(r.resolved);
      if (v.length === 9 && v.charAt(0) === "#") alpha = alpha + 1;
    }

    // The categorical chart palette, and the one number that makes grading it
    // vacuous rather than merely uninteresting.
    const slots = [];
    for (let i = 0; i < everywhere.length; i++) {
      const n = everywhere[i];
      if (n.indexOf("data-") === 0 && n.indexOf("-color-emphasis") > 0) slots.push(n);
    }
    let worstChart = -1;
    for (let t = 0; t < themeIds.length; t++) {
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          for (let r = 0; r < shown.length; r++) {
            const readerId = shown[r];
            const a = colour(themeIds[t], slots[i]), b = colour(themeIds[t], slots[j]);
            const d = gap(a, b, readerId === "trichromat" ? null : matrixOf(byId[readerId]));
            if (worstChart < 0 || d < worstChart) worstChart = d;
          }
        }
      }
    }

    const census = [
      { id: "declared", fact: "declarations this app holds in every one of the fourteen themes", count: everywhere.length, says: "the closure's own cross-theme population, which is what a cross-theme count below can be asked about" },
      { id: "held", fact: "token rows this app holds", count: tokens.length, says: "the stated closure: the opposition members, the pairing members, the chart slots, their alias closures in every theme, and one nominated theme entire" },
      { id: "invariant", fact: "of those, byte-identical in all fourteen", count: invariant, says: "no axis moves these at all" },
      { id: "ground-only", fact: "of those, the reader and contrast axes never move", count: groundOnly, says: "their resolved value is constant within each ground, so only the ground changes them" },
      { id: "class-changers", fact: "of those, changing value class between themes", count: classChangers, says: "a literal in one theme and an alias in another" },
      { id: "retargeting", fact: "of those, an alias in all fourteen that retargets", count: retargeting, says: "an alias pointing somewhere different depending on the theme, which is why resolution is per-theme" },
      { id: "alpha", fact: "declarations of light that resolve to a translucent colour", count: alpha, says: "each composited over its own theme's default ground before it is measured" },
      { id: "dimmed-vs-dark", fact: "of those held everywhere, differing between the dimmed ground and dark", count: dimmedDiff, says: "the dimmed ground is a third ground and not a variant of dark" },
      { id: "chart-slots", fact: "categorical chart colours", count: slots.length, says: "constant within each ground, so no colorblind or tritanopia theme touches them" },
      { id: "chart-separation", fact: "the worst all-pairs separation among the chart colours, at hundredths", count: worstChart, says: "far under every floor in every theme and for every reader, so grading a seventeen-slot categorical set would be vacuous in the other direction" },
    ];

    // --- write differentially ----------------------------------------------

    const updates = [];
    const diff = (entity, wanted, holdRows) => {
      const by = {};
      const rowsHeld = holdRows ?? [];
      for (let i = 0; i < rowsHeld.length; i++) by[txt(rowsHeld[i].id)] = rowsHeld[i];
      for (let i = 0; i < wanted.length; i++) {
        const w = wanted[i];
        const have = by[txt(w.id)];
        delete by[txt(w.id)];
        if (have === undefined) {
          updates.push({ op: "put", entity: entity, id: w.id, row: w });
          continue;
        }
        let same = true;
        for (const k in w) if (txt(have[k]) !== txt(w[k])) same = false;
        if (!same) updates.push({ op: "put", entity: entity, id: w.id, row: w });
      }
      for (const id in by) updates.push({ op: "delete", entity: entity, id: id });
    };
    // The order is load-bearing: `census` is stated LAST, and the audit screen's
    // second focus ear listens on one of its rows. Reordering these silently
    // gives `focus` a world with no readings in it and no second wake to correct
    // it, so every specimen would stand unpainted with nothing red.
    diff("reading", readings, rows.reading);
    diff("ratio", ratios, rows.ratio);
    diff("score", scores, rows.score);
    diff("census", census, rows.census);
    return { updates: updates };
  } catch (err) {
    return {
      updates: [{
        op: "patch",
        entity: "fold",
        id: "audit",
        row: { error: txt(err && err.message ? err.message : err) },
      }],
    };
  }
};
