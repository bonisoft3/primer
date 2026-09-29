---
pronto: alpha
name: primer
business: none — a reference implementation, published so the audit can be checked
stage: polished single-feature slice
team: studio
cluster: mecha
terminal: omnishell
loop: sayt
build: bayt
---

# Told Apart — can the reader this theme is named for tell these two colours apart?

**Told Apart is a colour-vision audit of GitHub's own design system: it takes the
fourteen themes @primer/primitives publishes, finds the pairs of colours whose
names promise an opposition — merged against closed, added against deleted,
success against danger — and says, for each theme and each reader, whether that
opposition survives.**

Six of those fourteen themes are named for a reader: two for red-green colour
blindness, two for tritanopia, and their high-contrast siblings. A theme named
for a reader is a claim about that reader, and it is a claim nobody publishes a
number for. This app computes the number.

The claim is not ours and neither is the method. Primer's theme names assert who
each theme is for. Primer's own token guide publishes the pairing rule — which
ground a foreground may sit on — and the threshold each pairing is held to.
The simulation is Machado, Oliveira and Fernandes 2009, at full severity. The
separation floors are the ones this repository already settled for categorical
palettes. Nothing here is a taste.

## What it finds

Four things, and the app is built so that each one is a number on a screen
rather than a sentence in a document:

- **The default theme fails.** In `light`, every graded opposition sits below the
  floor for a red-green dichromat. GitHub's merge-green against close-red, its
  added-line against its deleted-line, are — by the measure this repository
  already uses for chart palettes — not distinguishable. That is exactly why the
  colorblind theme exists, and it is the number Primer never states.
- **The mechanism works, and it is large.** `light` to `light-colorblind` under
  red-green improves every graded opposition and regresses none. The semantic
  opposition moves off the red-green axis onto blue-orange.
- **High contrast is orthogonal.** `light-high-contrast` moves hundreds of token
  values and buys not one graded opposition: it fails the same nineteen as
  `light`. A reader would guess otherwise.
- **No theme holds both axes.** Fixing red-green breaks blue-yellow. The
  colorblind themes take tritanopia separation from clean to failing, and both
  tritanopia themes trade rather than improve — the whole open/closed family
  goes backwards. And `dark-dimmed` is the worst theme in the corpus while its
  high-contrast sibling fixes none of it, so a reader who wants the dimmed
  ground has no colour-vision option at all: the four cells the theme set does
  not publish are all `dark-dimmed`.

## The theme set, and what this platform can hold of it

Primer's themes are three axes: the ground (`light`, `dark`, `dark-dimmed`), the
reader (trichromat, red-green, tritanopia) and the contrast (normal, high).
Three by three by two is eighteen cells; fourteen are published. The four that
are not are all `dark-dimmed`, and the app prints them as missing cells rather
than as an absence.

This platform's design layer holds **one identity in two appearances**, and the
two are closed twins. Pairing a light-ground theme against a dark-ground theme
by reader and contrast yields six clean pairs, and then `dark-dimmed` and
`dark-dimmed-high-contrast` have no light half at all. So exactly one of the six
pairs can be this app's own chrome, twelve themes are data, and two of the
fourteen can be neither half of any pronto identity.

The app **wears `light-colorblind-high-contrast` and
`dark-colorblind-high-contrast`** — the pair its own audit recommends, on the
audit's own criterion: fewest readings below the floor across the three
simulations, summed over the two grounds. It follows its number rather than the
family name, and says so on the screen. The consequence is stated rather
than decorated: because its own audit proves that no theme in its subject
survives all three readers, **no verdict in this app is carried by colour.**
Every verdict is a word. A tool that encoded its answer in a hue would be
unreadable to one of the three readers it serves, and its own subject is the
proof.

What the platform cannot hold is recorded as a finding, not worked around. The
app does not fabricate a light half for the dimmed ground to make the shape fit,
and every claim about what the design vocabulary refuses is measured by asking
`cue`, never asserted in prose.

## Data

- `Theme` — the fourteen: its ground, its reader, its contrast, which theme is
  its base, its twin on the other ground, and whether this platform can wear it
  and as which half.
- `Cell` — the eighteen cells of the cross, so the four the vendor does not
  publish are rows.
- `Segment` — Primer's opposition vocabulary: the six segment pairs, each with
  the sentence saying what the opposition means on a page.
- `Token` — the declarations the audit reads: for each theme, every token whose
  name carries an opposition segment, every token named by a published pairing,
  every categorical chart colour, the whole alias closure of those, and every
  declaration of one nominated theme entire. Each row says whether it holds a
  value or names another token, what it resolves to, its published type and its
  published description. Nothing writes to it.
- `Opposition` — the pair roster, derived: the two token names, the segment that
  differs, the family they belong to, the specimen they are drawn as, and
  whether the two are the same bytes in all fourteen themes and therefore not a
  discriminator at all.
- `Reader` — the four readings: the trichromat and the three simulations, each
  with the sentence saying who it is and the matrix that stands for them.
- `Floor` — the thresholds as rows, each saying where it came from: the
  separation target and floor from this repository's palette validator, the
  text and the large-text ratios from Primer's own published table.
- `Reading` — the graded rows: an opposition, a theme and a reader, with the two
  resolved colours, the two as that reader sees them, the ground they were
  composited over, the separation, the floor it is held to, the verdict, and how
  far it moved from the same opposition in the theme's base.
- `Pairing` — Primer's published matrix as rows: a ground token, an ink token,
  the threshold class the guide files it under, its ratio in each theme, and its
  verdict against **both** published thresholds, because the tokens do not say
  which row of the table a muted ground belongs to and picking one would be an
  opinion.
- `Claim` — the published claims in the vendor's own words, this app's reading
  of each, and a word for where the two part company; and the language findings,
  each with the probe that measures it.

## Screens

Six: the roster, one theme audited, one opposition across all fourteen, the
pairing sheet, the declarations, and the specification.

### 1. The roster

The fourteen themes, each with its ground, its reader, its contrast and its
verdict — how many of its semantic oppositions the reader it is named for can
tell apart, and how many it cannot. Then the four cells the vendor does not
publish, and the two themes no pronto identity can hold. The pair this app wears
is marked as the one it wears.

Opening a theme opens its audit.

### 2. One theme audited

The theme's oppositions, each drawn as the two things they actually are — a
merged badge beside a closed badge, an added diff line beside a deleted one —
painted in that theme's own values and in nothing else. Beside each pair, four
separations: what a trichromat sees and what each of the three dichromats sees,
each against the floor it is held to and each with the direction it moved from
this theme's base.

And the control that makes it a product rather than a table: the whole screen
repaints as any of the three readers, so the pair that is obvious to you goes
flat in front of you. The specimens are the same elements; only the simulation
changes.

### 3. One opposition, all fourteen themes

One opposition — success against danger, open against closed, added against
deleted — with its readings in a column ordered by theme: which themes hold it,
which do not, and which direction each variant moved it. This is the screen
where the tritanopia trade is visible: a column where the numbers go up in one
place and down in another under the same variant.

### 4. The pairing sheet

Primer's published pairing matrix, one row per obligation per theme, each drawn
as the text it would actually be: every emphasis ground under its on-emphasis
ink, every muted ground under its semantic ink, every default ground under its
default ink. Each row carries its ratio and its verdict against both published
thresholds, and says which threshold the guide files it under and which it is
ambiguous between. This is where the dimmed ground misses its own vendor's
published ratio on every muted pairing it has.

### 5. The declarations

The tokens the audit reads, a theme at a time: the name, whether it holds a
value or names another token, the chain it resolves through, what it resolves
to, its published type and its published description. Every column the audit
reads is a column shown. The nominated theme is shown entire; the others are
shown as far as the audit reaches, and the screen says which tokens it does not
hold and by what rule.

It is also where two facts about the shape are legible: a token that is a
literal in one theme and an alias in another, and an alias that points somewhere
different depending on the theme.

### 6. The specification

Primer's claims in Primer's words — what each theme name asserts, the pairing
rule, the threshold table — beside this app's reading and its verdict, in
separate columns, never merged. Then the readers with the matrices that stand
for them and the floors with their provenance. Then the language findings: what
this platform's design vocabulary can hold of a fourteen-theme system and what
it cannot, each row carrying the probe that measured it rather than a sentence
claiming it.

## Behavior

- **A pair is a pair because its names say so.** Two colour tokens are an
  opposition when their names differ in exactly one segment and that segment is
  one of the six the vendor's own vocabulary opposes. Nothing is hand-listed. A
  pair the rule admits that has no honest specimen is a declined row with the
  reason on it, never a silent drop.
- **A pair whose two members are the same bytes in all fourteen themes is not a
  discriminator.** The diff ink is identical everywhere: the ground carries that
  opposition and the ink does not. Those pairs are shown and are not graded for
  separation, and the screen says which.
- **Alpha is composited, never dropped.** Roughly an eighth of the resolved
  declarations carry an alpha channel, and a separation computed on the first six
  digits of an eight-digit hex is a wrong number that looks right. Every colour
  is composited over its own theme's default ground before it is measured, and
  that ground is a row on the screen rather than a constant in the code.
- **An alias is resolved to a fixpoint, in its own theme.** Twenty of the tokens
  are an alias in every theme and retarget between them, so resolving in the
  wrong theme's namespace silently reads another theme's colour.
- **The separation is measured on what was painted.** The audit is not a table
  of hexes: every graded number is checked against the colour a browser actually
  resolved on the specimen element. A custom property is never read for this,
  because a custom property's value is the unresolved two-argument form and not
  a colour.
- **The reader is a simulation and the app says so.** A dichromat's world is not
  a filter over a trichromat's, and the matrix is a published model at one
  severity. The model, its citation and its severity are on the specification
  screen, and every simulated colour on any screen is marked as simulated.
- **A verdict is a word.** Nothing on any screen distinguishes pass from fail by
  colour alone, because the app's own audit found no theme that survives all
  three readers. This is a consequence of the finding and it is checked as one.
- **Both thresholds are printed where the vendor is silent.** A muted ground
  under semantic ink is either normal text at the higher ratio or a user
  interface component at the lower one, and the tokens do not say. The app
  prints both verdicts and files the ambiguity as a stated departure, because
  picking one would turn a measurement into an opinion.
- **The reader axis stops at the semantic layer.** The categorical chart
  colours are constant within each ground across all fourteen themes: no
  colorblind theme touches them. The app records that as a finding with its
  number rather than grading a seventeen-slot categorical set no such set could
  pass.
- **Every published claim is asked of the app, and every number the app shows
  answers one.** Both directions are checked. A claim nothing drove is a
  failure; a number nothing grades is a failure, and the more serious of the two.
- **The app wears one of its own subjects, and it is the one its audit
  recommends.** For that pair alone, the swatch painted from a row and the
  chrome painted from a design token must resolve to the same colour in both
  appearances — so the platform's design layer is load-bearing on exactly the
  two themes it can hold, and the boundary between what it holds and what it
  cannot is a number rather than a paragraph.

![[acceptance.md]]

## Out of scope

- Every non-semantic token family. The categorical chart palette, the
  display palette and the label palette are named, counted and declined with the
  reason: they do not move on the reader axis, so grading them produces the same
  failure in all fourteen themes and says nothing about any of them.
- Anomalous trichromacy at partial severity. The model supports it; a severity
  dial turns a verdict into a slider and the floors this repository settled are
  for full severity. One severity, stated.
- The non-colour half of the design system. The theme layer publishes not one
  radius, spacing, font or duration — the split between base and theme is
  exactly the split between colour and everything else — so a theme audit is a
  colour audit, and the base layer is where this platform already quotes its
  type ladder from.
- Editing a theme, proposing a fix, or exporting a corrected palette. The app
  audits a published system; a tool that proposed a replacement colour would be
  making the aesthetic judgement this whole app exists to avoid.
- The eight-digit hex as an author's intent. A translucent token is measured
  over one ground; a real page has whatever is behind it. The choice of ground
  is stated and on screen, and a general answer needs a stacking context, which
  is a browser's question and not a palette's.
- A world where the two appearances are anything but two. Fourteen themes as
  fourteen selectable appearances is what this platform cannot express, and
  building a fork to fake it would replace the finding with a workaround.
