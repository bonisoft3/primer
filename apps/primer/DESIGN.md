---
preset: "press"
colors:
  neutral: "#ffffff"
  surface: "#ffffff"
  surface-muted: "#e6eaef"
  border: "#454c54"
  primary: "#010409"
  secondary: "#393f46"
  accent: "#023b95"
  danger: "#702c00"
  attention: "#603700"
dark:
  neutral: "#010409"
  surface: "#010409"
  surface-muted: "#151b23"
  border: "#b7bdc8"
  primary: "#ffffff"
  secondary: "#b7bdc8"
  accent: "#74b9ff"
  danger: "#ffb757"
  attention: "#f0b72f"
type:
  display: "2rem"
  title: "1.5rem"
  subtitle: "1.25rem"
  heading: "1rem"
  body: "0.9375rem"
  body-small: "0.875rem"
  label: "0.8125rem"
  caption: "0.75rem"
  overline: "var(--type-caption)"
  code: "var(--type-label)"
  leading-display: "1.15"
  leading-title: "1.25"
  leading-body: "1.5"
  leading-code: "1.45"
measures:
  page: "62rem"
  sheet: "48rem"
---

# Told Apart — the identity, and why it is one of its own subjects

This app grades a vendor's fourteen themes and then wears one of them. That is
not a joke about eating your own cooking: it is the only way to make the seam
between what this platform's design layer can hold and what it cannot into a
NUMBER rather than a paragraph.

## The frontmatter is the design block

The YAML above is the app's design block: what it names replaces the `press`
preset's value of that name, and what it leaves out the preset supplies. The
program embeds this file and reads the block through the platform's reader; it
restates none of it.

## The identity is adopted, not invented

Every value in the frontmatter above is a Primer declaration this app also
holds as a `Token` row. The light half is `light-colorblind-high-contrast` and
the dark half is `dark-colorblind-high-contrast`, resolved out of the vendored
stylesheets and given `press`'s role names. The pair is the one the app's own
audit recommends, worn: named as an adoption, and the paint check holds the
chrome and the theme's resolved ground equal in both appearances.

That pair is not a taste. It is what the audit's own criterion picks: fewest
readings below the separation floor across the three simulations, summed over
the two grounds a pronto identity pairs. The colorblind high-contrast pair
answers thirteen; the tritanopia pair twenty; the colorblind pair at normal
contrast twenty-two; the vendor's default pair forty-five. `tests/roster.test.ts`
computes that ranking from the vendored bytes and holds the worn pair to it,
and it also requires the winner to be a STRICT winner — a tie would make "the
pair its audit recommends" a preference with a number attached.

Because the identity is adopted rather than designed, `tests/paint.ts` can make
the boundary a measurement: for the adopted pair alone, the chrome painted from
a design token and the theme's own resolved ground must be the same colour, in
both appearances. Everywhere else the two are deliberately unrelated — the
subject theme is data, and a specimen is painted from a row.

## No verdict is carried by colour

The app's own audit found no theme in its subject that survives all three
readers. A tool that encoded pass and fail in a hue would therefore be
unreadable to one of the three readers it serves, and its own subject is the
proof. So every verdict on every screen is a WORD, `paint` asserts that every
verdict element carries text, and `coverage` asserts that no stylesheet in the
app holds a colour literal at all.

The literal rule is doing double duty here. Fourteen themes of hex cannot live
in a stylesheet, so every painted specimen has to arrive as a bound inline
custom property from a `Token` row — which is exactly what makes the paint
check grade the data path rather than grade this file.

## Type: what this app names, and what it costs

`press` ships six purposes and two leadings; this app sets ten purposes and
four leadings of its own, because it is a table of names, hex, integers and long
quoted sentences on one screen. The menu of purposes is the platform's —
`display`, `title`, `subtitle`, `heading`, `body`, `body-small`, `label`,
`caption`, `overline`, `code`, with `leading-` twins where the leading is a
decision — and the VALUES above are this app's own. `code` and `overline`
alias a sibling purpose through `var(--type-label)` and `var(--type-caption)`,
the one legal spelling of "the same value as that one".

The cost is measurable and not merely an absence. A role wins its norm, and
`best` keeps one step per (dimension, norm), so every purpose whose value
coincides with a vendored step DROPS that step from what this app's literal
lint can name. `fixtures/typerungs.ts` reads the emitted stylesheet and the
exported scale and writes the join; `tests/coverage.test.ts` re-reads both and
holds the rows to them. Fourteen purposes shadow seven of the eleven vendored
steps, and six purposes sit at a value neither ladder publishes.

## Both of Primer's layers, in two tiers

The platform quotes Primer's BASE ladder as rungs (`--base-text-size-*`,
`--base-text-lineHeight-*`). This app names its purposes from Primer's
FUNCTIONAL layer read as a list of purposes. The vendored scale deliberately
refuses the functional sheet, because `--fontStack-sansSerif` would put a
vendor's display face into every app's rung block; naming purposes as roles is
how the same vocabulary arrives without the face.

That the two layers land in two tiers is evidence the rung/role split is the
right seam. This is the app that demonstrates it rather than the document that
argues it, which is why every claim in this file is either a value above or a
line in a check named beside it.
