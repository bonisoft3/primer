// The machine rung of apps/primer: a pronto.#App compiled from ir.html (pinned
// below). Nobody reviews this; it must merely be checkable.
//
// Every entity takes the `tab` path (ir decision-01), so this program emits no
// migration, no policy, no publication and no pipeline. Nine collections are
// seeded from the vendored tarball and never written; five are written by one
// reduce at the mutation seat, which is the one seat an off-disk mount executes
// and therefore the only seat an oracle can grade.
@extern(embed)

package primer

import (
	"list"
	pronto "bonisoft.org/plugins/pronto"
)

// The seat key the interpreter coalesces on: the handler, then every table the
// reduce is handed, in the one order every seat states it. Two seats spelling
// the world differently are two seats, each running the fold over a world
// missing the other's writes.
_reads: "census,claim,floor,opposition,pairing,ratio,reading,reader,score,theme,token"

_designMd: _ @embed(file="DESIGN.md", type=text)

code: pronto.#App & {
	state: {
		// Token before everything the reduce reads it through, and Fold last: a
		// seat wakes when its own region's read changes, and the seat is pinned on
		// the Fold row so the world is whole by the time it lands.
		entityOrder: [
			"Token", "Theme", "Cell", "Segment", "Reader", "Floor", "Opposition",
			"Pairing", "Claim", "TypeRung", "Reading", "Ratio", "Score", "Census", "Cursor", "Fold",
		]
		entities: {
			Token: {
				id: "0x9ea139f998cdd3b6"
				table:      "token"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 120"},
					{ordinal: 2, name: "theme", type: "string", cel: "this.size() <= 40"},
					{ordinal: 3, name: "name", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "raw", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "kind", type: "string", cel: "this in ['literal', 'alias']"},
					{ordinal: 6, name: "target", type: "string", required: false, cel: "this.size() <= 80"},
					{ordinal: 7, name: "chain", type: "string", cel: "this.size() > 0"},
					{ordinal: 8, name: "resolved", type: "string", cel: "this.size() > 0"},
					{ordinal: 9, name: "composited", type: "string", required: false, cel: "this.size() <= 9"},
					{ordinal: 10, name: "type", type: "string", cel: "this in ['color', 'border', 'shadow']"},
					{ordinal: 11, name: "describes", type: "string", required: false, cel: "this.size() <= 400"},
					{ordinal: 12, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: _tokens
			}
			Theme: {
				id: "0xd0b4b4b79ef46913"
				table:      "theme"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 40"},
					{ordinal: 2, name: "ground", type: "string", cel: "this in ['light', 'dark', 'dark-dimmed']"},
					{ordinal: 3, name: "reader", type: "string", cel: "this in ['trichromat', 'red-green', 'tritanopia']"},
					{ordinal: 4, name: "contrast", type: "string", cel: "this in ['normal', 'high']"},
					{ordinal: 5, name: "base", type: "string", cel: "this.size() > 0"},
					{ordinal: 6, name: "wearable", type: "string", cel: "this in ['true', 'false']"},
					{ordinal: 7, name: "twin", type: "string", required: false, cel: "this.size() <= 40"},
					// Which appearance half this app wears it as, where it wears it at
					// all. A theme is wearable when its twin by (reader, contrast)
					// exists on the other ground; `wears` marks the one pair adopted.
					{ordinal: 8, name: "wears", type: "string", required: false, cel: "this in ['light', 'dark', '']"},
					// The declarations a screen ABOUT this theme is SET in. Columns on the
					// theme and not a join to Token, because the screen's root binds only
					// its own row.
					{ordinal: 9, name: "bg_default", type: "string", cel: "this.size() == 7"},
					{ordinal: 10, name: "bg_muted", type: "string", cel: "this.size() == 7"},
					{ordinal: 11, name: "border_default", type: "string", cel: "this.size() == 7"},
					{ordinal: 12, name: "fg_default", type: "string", cel: "this.size() == 7"},
					{ordinal: 13, name: "fg_muted", type: "string", cel: "this.size() == 7"},
					{ordinal: 14, name: "fg_accent", type: "string", cel: "this.size() == 7"},
					{ordinal: 15, name: "fg_danger", type: "string", cel: "this.size() == 7"},
					{ordinal: 16, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: _themes
			}
			Cell: {
				id: "0xdd09534d00f69f0e"
				table:      "cell"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 60"},
					{ordinal: 2, name: "ground", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "reader", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "contrast", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "theme", type: "string", required: false, cel: "this.size() <= 40"},
					{ordinal: 6, name: "published", type: "string", cel: "this in ['true', 'false']"},
				]
				seed: _cells
			}
			Segment: {
				id: "0xe042f92c45550598"
				table:      "segment"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 60"},
					{ordinal: 2, name: "left", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "right", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "says", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: _segments
			}
			Reader: {
				id: "0xe6c0ddea6193d176"
				table:      "reader"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 24"},
					{ordinal: 2, name: "name", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "says", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "severity", type: "string", cel: "this.size() > 0"},
					// The matrix as integers at millionths (fixtures/generate.ts says why). A
					// reduce has no matrix library, and a float column would put a rounding
					// argument between the two routes that are supposed to agree exactly.
					{ordinal: 5, name: "m00", type: "int32"}, {ordinal: 6, name: "m01", type: "int32"}, {ordinal: 7, name: "m02", type: "int32"},
					{ordinal: 8, name: "m10", type: "int32"}, {ordinal: 9, name: "m11", type: "int32"}, {ordinal: 10, name: "m12", type: "int32"},
					{ordinal: 11, name: "m20", type: "int32"}, {ordinal: 12, name: "m21", type: "int32"}, {ordinal: 13, name: "m22", type: "int32"},
					{ordinal: 14, name: "citation", type: "string", required: false, cel: "this.size() <= 400"},
					{ordinal: 15, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: _readers
			}
			Floor: {
				id: "0xdb2753f6e374e82c"
				table:      "floor"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 40"},
					{ordinal: 2, name: "value", type: "int32", cel: "this > 0"},
					{ordinal: 3, name: "applies", type: "string", cel: "this in ['separation', 'ratio']"},
					{ordinal: 4, name: "source", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "says", type: "string", cel: "this.size() > 0"},
					{ordinal: 6, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: _floors
			}
			Opposition: {
				id: "0xbe7770652319916e"
				table:      "opposition"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 80"},
					{ordinal: 2, name: "segment", type: "string", ref: "segment", cel: "this.size() > 0"},
					{ordinal: 3, name: "family", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "left_token", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "right_token", type: "string", cel: "this.size() > 0"},
					{ordinal: 6, name: "specimen", type: "string", cel: "this.size() > 0"},
					{ordinal: 7, name: "specimen_says", type: "string", cel: "this.size() > 0"},
					// Text and not bool, because a data-filter compares against text: a JSON
					// boolean here is a row `graded=eq.true` cannot reach, and the screen
					// would stand empty with nothing red.
					{ordinal: 8, name: "graded", type: "string", cel: "this in ['true', 'false']"},
					{ordinal: 9, name: "declined", type: "string", required: false, cel: "this.size() <= 200"},
					{ordinal: 10, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: _oppositions
			}
			Pairing: {
				id: "0xcc4255a194c34096"
				table:      "pairing"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 60"},
					{ordinal: 2, name: "ground_token", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "ink_token", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "semantic", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "klass", type: "string", cel: "this in ['text', 'ui']"},
					{ordinal: 6, name: "threshold_filed", type: "int32", cel: "this > 0"},
					// The vendor's guide does not say whether a muted ground under
					// semantic ink is normal text or an interface component, so a row
					// that says so carries both verdicts and this flag.
					{ordinal: 7, name: "ambiguous", type: "string", cel: "this in ['true', 'false']"},
					{ordinal: 8, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: _pairings
			}
			Claim: {
				id: "0x9167066063df7222"
				table:      "claim"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 60"},
					{ordinal: 2, name: "kind", type: "string", cel: "this in ['theme-name', 'pairing-rule', 'threshold', 'language']"},
					{ordinal: 3, name: "says", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "reads", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "departs", type: "string", cel: "this.size() > 0"},
					// The command or unification that measured the claim. Empty exactly
					// where the claim is the vendor's own sentence, which is quoted
					// rather than measured.
					{ordinal: 6, name: "probe", type: "string", required: false, cel: "this.size() <= 400"},
					{ordinal: 7, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: list.Concat([_claims, _language])
			}
			Reading: {
				id: "0xc820621d8959b931"
				table:      "reading"
				durability: "tab"
				writers:    "pipeline"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 160"},
					{ordinal: 2, name: "opposition", type: "string", cel: "this.size() > 0"},
					// Which pair of interface elements this reading is drawn as. Carried
					// on the reading and not read up from the opposition, because a
					// region root binds against its OWN row: a specimen has to be
					// paintable from the one row its verdict is on.
					{ordinal: 3, name: "specimen", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "theme", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "reader", type: "string", cel: "this.size() > 0"},
					{ordinal: 6, name: "left_color", type: "string", cel: "this.size() == 7"},
					{ordinal: 7, name: "right_color", type: "string", cel: "this.size() == 7"},
					// The same two colours as this reader sees them, so a specimen is
					// painted from the row the verdict is on and the reader control
					// repaints the same elements rather than swapping in a second set.
					{ordinal: 8, name: "left_seen", type: "string", cel: "this.size() == 7"},
					{ordinal: 9, name: "right_seen", type: "string", cel: "this.size() == 7"},
					{ordinal: 10, name: "ground", type: "string", cel: "this.size() == 7"},
					{ordinal: 11, name: "separation", type: "int32", cel: "this >= 0"},
					{ordinal: 12, name: "floor", type: "int32", cel: "this > 0"},
					{ordinal: 13, name: "verdict", type: "string", cel: "this in ['holds', 'fails', 'ungraded']"},
					{ordinal: 14, name: "delta", type: "int32"},
					{ordinal: 15, name: "pos", type: "int32", cel: "this >= 1"},
					// Which of the four readings the specimens on the audit screen are
					// currently painted as. Owned by `focus` alone, so a reader gesture
					// repaints without re-folding a thousand separations.
					{ordinal: 16, name: "painted", type: "string", required: false, cel: "this in ['yes', 'no', '']"},
				]
				// The slot the audit screen paints its specimens from binds exactly one
				// row per (theme, opposition), and this is the witness that says so:
				// `focus` marks one of the four readings and the slot pins that mark.
				uniques: [{name: "reading_painted", cols: ["theme", "opposition"], where: "painted=eq.yes"}]
				seed: []
			}
			Ratio: {
				id: "0xd807264cbe6f3aff"
				table:      "ratio"
				durability: "tab"
				writers:    "pipeline"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 120"},
					{ordinal: 2, name: "pairing", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "theme", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "ground_color", type: "string", cel: "this.size() == 7"},
					{ordinal: 5, name: "ink_color", type: "string", cel: "this.size() == 7"},
					{ordinal: 6, name: "ratio", type: "int32", cel: "this >= 100"},
					{ordinal: 7, name: "verdict_text", type: "string", cel: "this in ['holds', 'misses']"},
					{ordinal: 8, name: "verdict_ui", type: "string", cel: "this in ['holds', 'misses']"},
					{ordinal: 9, name: "ambiguous", type: "string", cel: "this in ['true', 'false']"},
				]
				seed: []
			}
			Score: {
				id: "0xd61b9890d9ff4b05"
				table:      "score"
				durability: "tab"
				writers:    "pipeline"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 80"},
					{ordinal: 2, name: "theme", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "reader", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "holds", type: "int32", cel: "this >= 0"},
					{ordinal: 5, name: "fails", type: "int32", cel: "this >= 0"},
					{ordinal: 6, name: "improved", type: "int32", cel: "this >= 0"},
					{ordinal: 7, name: "regressed", type: "int32", cel: "this >= 0"},
					{ordinal: 8, name: "unchanged", type: "int32", cel: "this >= 0"},
				]
				// The roster pins a score on its row's theme and its row's reader, which
				// is one row: this is the natural key that makes the slot a slot.
				uniques: [{name: "score_theme_reader", cols: ["theme", "reader"]}]
				seed: []
			}
			Census: {
				id: "0xd8ea0b6d55581c28"
				table:      "census"
				durability: "tab"
				writers:    "pipeline"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 40"},
					{ordinal: 2, name: "fact", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "count", type: "int32", cel: "this >= 0"},
					{ordinal: 4, name: "says", type: "string", cel: "this.size() > 0"},
				]
				seed: []
			}
			TypeRung: {
				id: "0xad4a73ccf47bbbde"
				table:      "type_rung"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this.size() <= 40"},
					{ordinal: 2, name: "purpose", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "value", type: "string", cel: "this.size() > 0"},
					{ordinal: 4, name: "resolved", type: "string", cel: "this.size() > 0"},
					{ordinal: 5, name: "dimension", type: "string", cel: "this in ['text', 'leading']"},
					// The vendored step whose value this purpose equals, and therefore
					// the step this app's literal lint cannot name (#Design.type in schema.cue
					// says why).
					{ordinal: 6, name: "coincides", type: "string", required: false, cel: "this.size() <= 60"},
					{ordinal: 7, name: "pos", type: "int32", cel: "this >= 1"},
				]
				seed: _typeRungs
			}
			Cursor: {
				id: "0xfedc25dbef0bb95c"
				table:      "cursor"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this == 'the'"},
					// Which of the four readings every specimen on the audit screen is painted as:
					// a Reader row's id, which is what the picker writes. The specimens are the same elements; only this moves.
					{ordinal: 2, name: "reader", type: "string", cel: "this in ['trichromat', 'protanopia', 'deuteranopia', 'tritanopia']"},
				]
				seed: [{id: "the", reader: "trichromat"}]
			}
			Fold: {
				id: "0x8bd02d636155ecc2"
				table:      "fold"
				durability: "tab"
				fields: [
					{ordinal: 1, name: "id", type: "string", pk: true, cel: "this == 'audit'"},
					{ordinal: 2, name: "note", type: "string", cel: "this.size() > 0"},
					{ordinal: 3, name: "error", type: "string", required: false, cel: "this.size() <= 400"},
				]
				seed: [{
					id:    "audit"
					note:  "the separations, the ratios, the roster's scores and the census, folded over the seeded declarations"
					error: ""
				}]
			}
		}
		pipelines: {}
	}

	capabilities: {
		blobs: false
		hatches: {}
		vendored: {}
	}

	surface: {
		screens: {
			roster: {
				title:  "Told Apart"
				route:  "/"
				markup: _rosterMarkup
				forms: []
				states: ["loading", "populated", "populated-dark"]
				files: shared: ["shell/shared/sheet.css"]
			}
			theme: {
				title:  "One theme audited"
				route:  "/theme/:theme"
				strip:  false
				keep:   0
				markup: _themeMarkup
				forms: []
				states: ["populated", "simulated", "populated-dark"]
				files: shared: ["shell/shared/sheet.css"]
			}
			opposition: {
				title:  "One opposition, all fourteen"
				route:  "/opposition/:opposition"
				strip:  false
				keep:   0
				markup: _oppositionMarkup
				forms: []
				states: ["populated", "populated-dark"]
				files: shared: ["shell/shared/sheet.css"]
			}
			pairings: {
				title:  "The pairing sheet"
				route:  "/pairings/:theme"
				strip:  false
				keep:   0
				markup: _pairingsMarkup
				forms: []
				states: ["populated", "populated-dark"]
				files: shared: ["shell/shared/sheet.css"]
			}
			tokens: {
				title:  "The declarations"
				route:  "/tokens/:theme"
				strip:  false
				keep:   0
				markup: _tokensMarkup
				forms: []
				states: ["populated", "populated-dark"]
				files: shared: ["shell/shared/sheet.css"]
			}
			spec: {
				title:  "The specification"
				route:  "/spec"
				strip:  false
				keep:   1
				markup: _specMarkup
				forms: []
				states: ["populated", "populated-dark"]
				files: shared: ["shell/shared/sheet.css"]
			}
		}

		handlers: {
			audit: {
				of:   "roster"
				src:  "shell/handlers/audit.js"
				note: "the app's own simulation and OKLab distance, over the seeded declarations"
			}
			focus: {
				of:   "theme"
				src:  "shell/handlers/focus.js"
				note: "which of the four readings the specimens are painted as, patched on the readings the audit already computed"
			}
		}

		design: (pronto.#DesignMd & {text: _designMd}).design

		flows: {
			"open-audit": {of: "roster", entity: "Theme", action: "navigate"}
			"open-opposition": {of: "theme", entity: "Opposition", action: "navigate"}
			"pick-reader": {of: "theme", entity: "Cursor", action: "update"}
		}
	}

	meta: {
		name:        "primer"
		description: "A colour-vision audit of the fourteen themes @primer/primitives publishes, one number per opposition per reader."
		ir: {sha256: "064ff608d4b01daba3680efefd31593f27a03c7a6438336ac32cd866b5a038e7"}
		targets: ["pages"]
		decisions: {
			"decision-01": {}
			"decision-02": {}
			"decision-03": {}
			"decision-04": {}
			"decision-05": {}
			"decision-06": {}
			"decision-07": {}
			"decision-08": {}
			"decision-09": {}
			"decision-10": {}
		}
		tests: {
			"test-fixture": {
				of: "Token"
				says:  "every seeded row is what a second parse of the vendored bytes says, name for name and byte for byte, and the quotation the suite grades is hashed in the suite"
				given: {themes: 14, tokens: 2376}
				when:  "the fixture suite runs"
				then:  "output.rows == input.tokens && output.mismatched == 0 && output.quotationPinned"
			}
			"test-separation": {
				of: "Reading"
				says:  "every separation the app prints equals the one the independent route computes, and the per-theme verdict distribution is the tarball's rather than any constant"
				given: {readings: 798, graded: 19, themes: 14}
				when:  "each theme's audit is mounted off the seed"
				then:  "output.compared == input.readings && output.disagreements == 0 && output.lightRedGreenFails == input.graded"
			}
			"test-pairing": {
				of: "Ratio"
				says:  "every ratio equals the independent route's, both threshold verdicts are on every row, and the dimmed ground's twelve muted misses are named individually"
				given: {ratios: 364, mutedMisses: 12}
				when:  "the pairing sheet is mounted for each theme"
				then:  "output.compared == input.ratios && output.disagreements == 0 && output.dimmedMutedMisses == input.mutedMisses"
			}
			"test-census": {
				of: "Census"
				says:  "the reader axis stops at the semantic layer: the chart colours are constant within each ground and their all-pairs separation is under half a unit everywhere"
				given: {slots: 17}
				when:  "the declarations screen is mounted"
				then:  "output.slots == input.slots && output.worstSeparation < 50 && output.readerAxisReaches == 0"
			}
			"test-coverage": {
				of: "roster"
				says:  "both anti-joins run and each is driven to red on a doctored input by its own case"
				given: {antiJoins: 2}
				when:  "the coverage suite runs"
				then:  "output.unshown == [] && output.ungraded == [] && output.doctoredRed == input.antiJoins"
			}
			"test-paint": {
				of: "theme"
				says:  "the separation recomputed from the colours a browser actually painted on the specimens equals the ground truth's, in both appearances"
				given: {themes: 14, appearances: 2}
				when:  "chromium loads every theme's audit over the running cluster"
				then:  "output.screens == input.themes * input.appearances && output.disagreements == 0"
			}
			"test-roster": {
				of: "roster"
				says:  "the roster lands on the fourteen with their scores computed before any control is touched, and the four unpublished cells and two orphan themes are rows"
				given: {themes: 14, cells: 18, unpublished: 4}
				when:  "render"
				then:  "output.themes == input.themes && output.cells == input.cells && output.missing == input.unpublished && output.writes == 0"
			}
			"test-routes": {
				of: "opposition"
				says:  "each theme has its own address and two addresses that name different themes never paint the same specimens"
				given: {themes: 14}
				when:  "two addresses are opened in turn"
				then:  "output.distinct == input.themes && output.leaked == 0"
			}
		}
	}
}

cluster: (pronto.#DefaultCluster & {"code": code, statics: terminal.surface.statics}).out
terminal: (pronto.#DefaultTerminal & {"code": code}).out
loop: (pronto.#DefaultLoop & {"code": code, "cluster": cluster, "terminal": terminal}).out

// The five graders that run with no cluster up, each named for what it can see.
// None sees a painted pixel; `paint`, below, does.
loop: surface: checks: "fixture": {
	verb: "test"
	cmds: ["deno test --config tests/deno.json --no-lock --no-check --allow-env --allow-read tests/fixture.test.ts"]
	note: "every seeded row against a second parse of the vendored bytes, and the quotation hashed in the suite rather than in the fixture"
}
loop: surface: checks: "separation": {
	verb: "test"
	cmds: ["deno test --config tests/deno.json --no-lock --no-check --allow-env --allow-read tests/separation.test.ts"]
	note: "every printed separation against the independent route, then the per-theme verdict distribution and each of the four findings as a direction"
}
loop: surface: checks: "pairing": {
	verb: "test"
	cmds: ["deno test --config tests/deno.json --no-lock --no-check --allow-env --allow-read tests/pairing.test.ts"]
	note: "every ratio against the independent route, both threshold verdicts present, and the dimmed ground's muted misses named"
}
loop: surface: checks: "census": {
	verb: "test"
	cmds: ["deno test --config tests/deno.json --no-lock --no-check --allow-env --allow-read tests/census.test.ts"]
	note: "the reader axis stops at the semantic layer, with the number that makes grading the chart palette vacuous"
}
loop: surface: checks: "coverage": {
	verb: "test"
	cmds: ["deno test --config tests/deno.json --no-lock --no-check --allow-env --allow-read --allow-run=cue tests/coverage.test.ts"]
	note: "both anti-joins, the ledger, the claims, and the language findings measured by asking cue"
}
loop: surface: checks: "roster": {
	verb: "test"
	cmds: ["deno test --config tests/deno.json --no-lock --no-check --allow-env --allow-read tests/roster.test.ts"]
	note: "the roster cold, the four unpublished cells as rows, the adopted pair against the audit's own criterion, and one address per theme"
}

// The spine's clamp, and the only check in this app that can see a blank page;
// tests/paint.ts says why it stays whole and stays a gate.
loop: surface: checks: "paint": {
	verb: "integrate"
	cmds: [
		"docker compose up -d --wait --build launch",
		"deno run --allow-read --allow-write --allow-net --allow-env --allow-run --allow-sys --unsafely-ignore-certificate-errors tests/paint.ts .",
	]
	note: "the separation recomputed from getComputedStyle on both specimen elements of every graded opposition, over all fourteen themes in both appearances"
}

build: (pronto.#DefaultBuild & {"code": code, "loop": loop, "cluster": cluster}).out

out: pronto.#emit & {"code": code, "cluster": cluster, "terminal": terminal, "loop": loop, "build": build}
