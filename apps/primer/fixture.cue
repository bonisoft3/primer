// The seed, embedded from the bytes fixtures/generate.ts wrote out of the
// vendored tarball. Embedded rather than restated in CUE so the oracle, the
// screens and the fixture check all read the SAME rows — which is the whole of
// why "the number the app prints" and "the number the oracle computes" are two
// answers and not one.
@extern(embed)

package primer

_themes:      _ @embed(file="fixtures/themes.json")
_cells:       _ @embed(file="fixtures/cells.json")
_segments:    _ @embed(file="fixtures/segments.json")
_readers:     _ @embed(file="fixtures/readers.json")
_floors:      _ @embed(file="fixtures/floors.json")
_tokens:      _ @embed(file="fixtures/tokens.json")
_oppositions: _ @embed(file="fixtures/oppositions.json")
_pairings:    _ @embed(file="fixtures/pairings.json")
_claims:      _ @embed(file="fixtures/claims.json")
// Measured off the EMITTED stylesheet by fixtures/typerungs.ts, not authored:
// written by hand the shadowing count drifts on the first value change.
_typeRungs: _ @embed(file="fixtures/typerungs.json")
