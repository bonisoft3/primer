// The language findings: what this platform's design vocabulary can hold of a
// fourteen-theme system and what it cannot.
//
// Each row carries the PROBE that measured it — the unification and what `cue`
// said — rather than a sentence asserting it.  `tests/coverage.test.ts` runs every probe below and holds cue's
// answer to the reading beside it.
package primer

_language: [
	{
		id:   "lang-one-identity"
		kind: "language"
		says: "#Design holds ONE identity in TWO appearances, and both halves of that are closed: `dark` is close({for k, _ in colors}), appearance is exactly the pair, and #App.surface.design refuses a second named identity by name."
		reads: "A design system that publishes a SET of themes cannot be held in the vocabulary at all. This app's subject publishes fourteen, so twelve of them are data and at most one pair can be worn."
		departs: "the vocabulary refuses what the vendor publishes, and this app records that rather than forking the vocabulary to fake fourteen selectable appearances"
		probe:   "unify a real #Design with a third appearance bucket, and again with a second identity key, and report what cue says"
		pos:     10
	},
	{
		id:   "lang-twin-asymmetry"
		kind: "language"
		says: "Primer's axes are ground × reader × contrast = 3 × 3 × 2, and the published set is not the cross product: fourteen of eighteen cells exist and the four missing all name dark-dimmed."
		reads: "Pairing a light-ground theme against a dark-ground one by (reader, contrast) yields six clean twins, and then two themes have no light half at all. So a pronto app can WEAR exactly one of six pairs, twelve themes are data, and two can be neither half of any identity."
		departs: "daisyUI's thirty-five could not produce this finding: its themes vary mood, so there was no pairing rule to be asymmetric under"
		probe:   "the join over Theme and Cell rows, printed on the roster: wearable light-ground themes, their twins, and the themes with none"
		pos:     11
	},
	{
		id:   "lang-no-workaround"
		kind: "language"
		says: "The dimmed ground has no light half, and this app fabricates none."
		reads: "The four unpublished cells and the two orphan themes are rows on the roster. A worked-around gap is an unrecorded finding."
		departs: "none — the gap is printed rather than filled"
		probe:   "the roster's cells and orphans lists, asserted against the ground truth's own cross product"
		pos:     12
	},
	{
		id:   "lang-boundary-is-a-number"
		kind: "language"
		says: "The seam between what the design layer holds and what it cannot is a number, not a paragraph."
		reads: "For the adopted pair alone, a swatch painted from a Token row and a chrome element painted from a design token must resolve to the same colour in both appearances. The design layer is load-bearing on exactly the two themes it can hold."
		departs: "none — the boundary goes red when it moves"
		probe:   "the paint check's adopted-pair case, over getComputedStyle in both appearances"
		pos:     13
	},
	{
		id:   "lang-press-type"
		kind: "language"
		says: "`press` ships six purposes and two leadings; the MENU of purposes is the platform's, and this app sets ten values of its own."
		reads: "An app whose screens need more than press names pays for every purpose it adds, and the cost is measurable and not merely an absence — a role wins its norm and `best` keeps one step per (dimension, norm), so every purpose whose value coincides with a vendored step drops that step from what the literal lint can name IN THE APP THAT NAMED IT."
		departs: "none — the count is read off the emitted stylesheet, so it moves when a purpose does"
		probe:   "count, off the emitted shell/design.css and the exported scale, the --type-* roles whose value equals a vendored step's"
		pos:     14
	},
	{
		id:   "lang-two-primer-layers"
		kind: "language"
		says: "Both of Primer's layers are present here, in two tiers: the platform quotes Primer's BASE ladder as rungs (`text`, `leading`), and this app names its purposes from Primer's FUNCTIONAL layer read as a list of purposes."
		reads: "The vendored scale deliberately refuses the functional sheet because --fontStack-sansSerif would put a vendor's display face in every app's rung block; naming purposes as roles is how the same vocabulary arrives without the face."
		departs: "none — that the two layers land in two tiers is evidence the rung/role split is the right seam, and this is the app that demonstrates it rather than arguing it"
		probe:   "the vendored scale tree's admitted.json against the app's own --type-* role names"
		pos:     15
	},
	{
		id:   "lang-colour-is-the-only-axis"
		kind: "language"
		says: "Colour is the only dimension a theme layer varies: Primer's fourteen theme files publish not one radius, spacing, font, duration or border width."
		reads: "Every declaration in every theme file is a colour, a border shorthand or a shadow list, and the two var() targets the themes reference and never declare are both in a base layer that imports no theme. So the appearance seam and the colour seam are the same seam in a real published system, which is exactly what light-dark() on one declaration per colour assumes."
		departs: "none — this is a confirmation of the platform's choice, and worth recording because the daisyUI oracle could not distinguish a vendor's architecture from a coincidence"
		probe:   "the published $type of every one of the 959 declarations, asserted identical across all fourteen themes"
		pos:     16
	},
	{
		id:   "lang-verbatim-vs-placeholder"
		kind: "language"
		says: "The terminal's visual battery refuses any rendered text matching `{word}` as an unresolved binding, at severity critical."
		reads: "Primer's published pairing rule IS `--fgColor-{semantic}`, and this app quotes the Logic Matrix verbatim — so the one screen that carries the vendor's own words cannot pass a check that cannot tell a quotation from a leak. The app declines to tidy the quotation: `tests/fixture.test.ts` holds every quoted sentence to a substring of the vendored guide, so rewording it to clear the battery would move a column that is supposed to be a quotation."
		departs: "`just integrate` is RED on this one finding and stays red. The battery's rule is a heuristic over innerText and this is the first app in the corpus to render a vendor's token-naming convention as text; the honest fix belongs in the check — a quotation needs a way to say it is one — and not in the quotation."
		probe:   "docker compose -p primer --profile '*' -f .bayt/compose.integrate.closure.yaml up bayt — check-visual reports placeholder-leak {semantic} on /spec at both widths"
		pos:     18
	},
	{
		id:   "lang-reader-axis-stops"
		kind: "language"
		says: "The reader axis stops at the semantic layer: Primer's categorical chart palette is constant within each ground across all fourteen themes."
		reads: "A design system that ships accessibility themes ships them for its semantics and not for its charts. The app records the number rather than grading it, because a seventeen-slot categorical set cannot clear an all-pairs floor and grading it would be vacuous in the other direction."
		departs: "the app declines to grade a family it holds, and prints the separation that is the reason"
		probe:   "the Census rows `ground-only`, `chart-slots` and `chart-separation`, each a reduce over the Token rows the app holds"
		pos:     17
	},
]
