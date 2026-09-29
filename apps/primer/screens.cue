// The six screens' markup, authored here and emitted to shell/screens/*.html.
//
// No stylesheet in this app may hold a colour literal, so every specimen is
// painted from a row through a bound inline custom property. That is not a
// nuisance the screens work around: it is what makes `paint` grade the data path
// rather than a stylesheet, and a screen that reached for a literal to get a
// specimen looking right would make that check green over nothing.
package primer

import "strings"

// Seat A, verbatim at every site it stands. The key the interpreter coalesces on
// is [handler, ...data-reads, ...sorted data-read-*], so a reordered list is two
// seats where the markup says one, each folding over a world missing the other's
// writes.
_seat: """
	  <div class="seat" data-live="fold" data-filter="id=eq.audit"
	       data-on-mutation="audit" data-reads="\(_reads)">
	    <template data-item>
	      <div class="seat-body">
	        <p class="seat-says" data-text="{note}"></p>
	        <p class="seat-error" data-text="{error}"></p>
	      </div>
	    </template>
	  </div>
	"""

// A screen ABOUT one theme is SET in it: the app's design roles, bound on the
// screen's root from the subject's own declarations. `subject` is what a
// stylesheet acts on; the mapping from Primer's name to this app's role is here
// and nowhere else.
//
// --neutral and --surface arrive from one declaration because the app's own
// identity holds the two equal, and that relationship is the subject's to
// inherit. --attention is the one role no column carries: nothing inside a
// themed root reads it, so it stays at the app's own value.
_wearsSubject: #"style="--neutral: {bg_default}; --surface: {bg_default}; --surface-muted: {bg_muted}; --border: {border_default}; --primary: {fg_default}; --secondary: {fg_muted}; --accent: {fg_accent}; --danger: {fg_danger}""#

// The three specimens a graded pair is drawn as, keyed off the opposition's own
// `specimen` column: what the two colours ARE on a page is a background, an ink
// or a rule, and the class is what a stylesheet can act on.
_pairSpecimens: """
	              <div class="pair" data-specimen="{specimen}" style="--left: {left_seen}; --right: {right_seen}; --ground: {ground}">
	                <span class="side side-left"><span class="chip"></span><span class="word">added</span></span>
	                <span class="side side-right"><span class="chip"></span><span class="word">removed</span></span>
	              </div>
	"""

// One reading's row: the number, the floor it is held to, the verdict as a WORD,
// and the signed movement from this theme's base. Nothing here distinguishes
// pass from fail by colour, because this app's own audit found no theme that
// survives all three readers.
_readingRow: """
	                <li class="reading" data-verdict="{verdict}">
	                  <span class="who" data-text="{reader}"></span>
	                  <span class="fig sep" data-text="{separation}"></span>
	                  <span class="fig floor" data-text="{floor}"></span>
	                  <span class="word verdict" data-text="{verdict}"></span>
	                  <span class="fig delta" data-text="{delta}"></span>
	                </li>
	"""

// --- 1. the roster ---------------------------------------------------------

// One block per ground, so the fourteen read grouped without a region that can
// group. The ground is the outer row's own value, which is also what makes the
// nested read a filter rather than a partition.
_rosterGrounds: strings.Join([for g in ["light", "dark", "dark-dimmed"] {"""
	      <section class="ground" data-ground="\(g)">
	        <h2>\(g)</h2>
	        <ul class="themes" data-live="theme" data-filter="ground=eq.\(g)" data-order="pos.asc"
	            data-empty="No themes on this ground.">
	          <template data-item>
	            <li class="theme-row" data-wears="{wears}" data-wearable="{wearable}">
	              <a class="theme-name" data-route="theme" data-param-theme="{id}" data-text="{id}"></a>
	              <span class="axis reader" data-text="{reader}"></span>
	              <span class="axis contrast" data-text="{contrast}"></span>
	              <span class="axis base">from <span data-text="{base}"></span></span>
	              <span class="wears" data-text="{wears}"></span>
	              <span class="score" data-live="score" data-filter="theme=eq.{id}&reader=eq.{reader}" data-empty="">
	                <span class="fig holds" data-text="{holds}"></span>
	                <span class="fig fails" data-text="{fails}"></span>
	                <span class="fig improved" data-text="{improved}"></span>
	                <span class="fig regressed" data-text="{regressed}"></span>
	                <span class="fig unchanged" data-text="{unchanged}"></span>
	              </span>
	              <a class="to-pairings" data-route="pairings" data-param-theme="{id}">pairings</a>
	              <a class="to-tokens" data-route="tokens" data-param-theme="{id}">declarations</a>
	            </li>
	          </template>
	        </ul>
	      </section>
	"""}], "\n")

_rosterMarkup: """
	<section class="screen" data-screen="roster">
	  <header class="page-head">
	    <h1>Told Apart</h1>
	    <p class="lede">Can the reader this theme is named for tell these two colours apart? Fourteen themes,
	      nineteen graded semantic oppositions, four readings each. Every verdict on every screen is a WORD:
	      this app's own audit found no theme in its subject that survives all three readers, so nothing here
	      is carried by colour.</p>
	    <p class="wearing">This app wears <a data-route="theme" data-param-theme="light-colorblind-high-contrast">light-colorblind-high-contrast</a> and
	      <a data-route="theme" data-param-theme="dark-colorblind-high-contrast">dark-colorblind-high-contrast</a> — the pair its own audit
	      recommends on its own criterion: fewest readings below the floor across the three simulations, summed
	      over the two grounds.</p>
	    <p class="ways"><a data-route="spec">The specification</a></p>
	  </header>

	\(_seat)

	\(_rosterGrounds)

	  <section class="cross">
	    <h2>The cross</h2>
	    <p class="note">Ground by reader by contrast is eighteen cells. Fourteen are published, and the four
	      that are not all name one ground.</p>
	    <ul class="cells" data-live="cell" data-order="id.asc" data-empty="No cells.">
	      <template data-item>
	        <li class="cell" data-published="{published}">
	          <span class="axis" data-text="{ground}"></span>
	          <span class="axis" data-text="{reader}"></span>
	          <span class="axis" data-text="{contrast}"></span>
	          <span class="cell-theme" data-text="{theme}"></span>
	          <span class="word cell-state" data-text="{published}"></span>
	        </li>
	      </template>
	    </ul>
	  </section>

	  <section class="twins">
	    <h2>What a pronto identity can hold</h2>
	    <p class="note">This platform's design layer holds one identity in two appearances, and the two are
	      closed twins. Pairing a light-ground theme against a dark-ground one by reader and contrast gives
	      the pairs below; the themes after them have no light half at all, and none is invented for them.</p>
	    <ul class="pairs" data-live="theme" data-filter="ground=eq.light&wearable=eq.true" data-order="pos.asc"
	        data-empty="No twinnable pairs.">
	      <template data-item>
	        <li class="twin" data-wears="{wears}">
	          <span class="half" data-text="{id}"></span>
	          <span class="half" data-text="{twin}"></span>
	          <span class="word twin-state" data-text="{wears}"></span>
	        </li>
	      </template>
	    </ul>
	    <ul class="orphans" data-live="theme" data-filter="wearable=eq.false" data-order="pos.asc"
	        data-empty="Every theme has a twin.">
	      <template data-item>
	        <li class="orphan">
	          <span class="half" data-text="{id}"></span>
	          <span class="word">no light half, so neither half of any pronto identity</span>
	        </li>
	      </template>
	    </ul>
	  </section>
	</section>
	"""

// --- 2. one theme audited --------------------------------------------------

// The reader picker. Four buttons, one per Reader row, each a form that writes
// the one Cursor row — so the gesture is a submit like every other mutation here
// and no control computes.
_readerPicker: """
	      <ul class="readers" data-live="reader" data-order="pos.asc" data-empty="No readers.">
	        <template data-item>
	          <li>
	            <form data-entity="cursor" data-action="upsert">
	              <input type="hidden" name="id" data-value="the">
	              <input type="hidden" name="reader" data-value="{id}">
	              <button type="submit" data-text="{name}"></button>
	            </form>
	            <span class="reader-says" data-text="{says}"></span>
	          </li>
	        </template>
	      </ul>
	"""

_themeMarkup: """
	<section class="screen" data-screen="theme">
	  <div class="root" data-live="theme" data-filter="id=eq.{param.theme}">
	    <template data-item>
	      <article class="one-theme subject" data-theme="{id}" data-ground="{ground}"
	               \(_wearsSubject)>
	        <p class="back"><a data-route="roster">‹ The fourteen</a></p>
	        <h1 data-text="{id}"></h1>
	        <p class="axes">
	          <span class="axis" data-text="{ground}"></span>
	          <span class="axis" data-text="{reader}"></span>
	          <span class="axis" data-text="{contrast}"></span>
	          <span class="axis">measured against <span data-text="{base}"></span></span>
	        </p>
	        <p class="ways">
	          <a data-route="pairings" data-param-theme="{id}">its pairing sheet</a>
	          <a data-route="tokens" data-param-theme="{id}">its declarations</a>
	        </p>

	\(_seat)

	        <!-- Seat B, twice. A data-on-mutation seat wakes when its OWN region's
	             read changes and at no other time, so the cursor ear alone would
	             fire once at mount — before `audit` has written a single reading —
	             and never again. The second ear listens on the LAST row `audit`
	             writes, which is what closes the graph. Same handler and same
	             data-reads, so the two coalesce into one seat. -->
	        <div class="seat focus-seat" data-live="cursor" data-filter="id=eq.the"
	             data-on-mutation="focus" data-reads="cursor,reading">
	          <template data-item>
	            <p class="seat-says">Every specimen below is painted as <span class="simulated" data-text="{reader}"></span> sees it.
	              A simulated colour is marked simulated wherever it appears.</p>
	          </template>
	        </div>

	        <div class="seat focus-echo" data-live="census" data-filter="id=eq.chart-separation"
	             data-on-mutation="focus" data-reads="cursor,reading">
	          <template data-item>
	            <p class="seat-says" data-text="{says}"></p>
	          </template>
	        </div>

	\(_readerPicker)

	        <ul class="oppositions" data-live="opposition" data-filter="graded=eq.true" data-order="pos.asc"
	            data-empty="No graded oppositions.">
	          <template data-item>
	            <li class="op">
	              <h2><a data-route="opposition" data-param-opposition="{id}" data-text="{id}"></a></h2>
	              <p class="op-says">
	                <span class="tok" data-text="{left_token}"></span>
	                <span class="tok" data-text="{right_token}"></span>
	                <span class="drawn" data-text="{specimen_says}"></span>
	              </p>
	              <div class="specimen simulated" data-live="reading"
	                   data-filter="theme=eq.{param.theme}&opposition=eq.{id}&painted=eq.yes" data-empty="">
	\(_pairSpecimens)
	                <p class="over">composited over <span class="fig" data-text="{ground}"></span></p>
	              </div>
	              <ul class="readings" data-live="reading"
	                  data-filter="theme=eq.{param.theme}&opposition=eq.{id}" data-order="pos.asc"
	                  data-empty="No readings.">
	                <template data-item>
	\(_readingRow)
	                </template>
	              </ul>
	            </li>
	          </template>
	        </ul>

	        <section class="declined">
	          <h2>Admitted by the rule and not graded</h2>
	          <ul data-live="opposition" data-filter="graded=eq.false" data-order="pos.asc"
	              data-empty="Every pair the rule admits is graded.">
	            <template data-item>
	              <li class="declined-row">
	                <span class="tok" data-text="{left_token}"></span>
	                <span class="tok" data-text="{right_token}"></span>
	                <span class="word reason" data-text="{declined}"></span>
	              </li>
	            </template>
	          </ul>
	        </section>
	      </article>
	    </template>
	  </div>
	</section>
	"""

// --- 3. one opposition, all fourteen ---------------------------------------

_oppositionMarkup: """
	<section class="screen" data-screen="opposition">
	  <div class="root" data-live="opposition" data-filter="id=eq.{param.opposition}">
	    <template data-item>
	      <article class="one-op" data-opposition="{id}">
	        <p class="back"><a data-route="roster">‹ The fourteen</a></p>
	        <h1 data-text="{id}"></h1>
	        <p class="op-says">
	          <span class="tok" data-text="{left_token}"></span>
	          <span class="tok" data-text="{right_token}"></span>
	          <span class="drawn" data-text="{specimen_says}"></span>
	        </p>
	        <p class="seg" data-live="segment" data-filter="id=eq.{segment}" data-empty="">
	          <span data-text="{says}"></span>
	        </p>

	\(_seat)

	        <ul class="column" data-live="reading"
	            data-filter="opposition=eq.{param.opposition}" data-order="theme.asc,pos.asc"
	            data-empty="No readings.">
	          <template data-item>
	            <li class="cell-reading" data-verdict="{verdict}">
	              <a class="theme-name" data-route="theme" data-param-theme="{theme}" data-text="{theme}"></a>
	              <span class="who" data-text="{reader}"></span>
	              <span class="fig sep" data-text="{separation}"></span>
	              <span class="fig floor" data-text="{floor}"></span>
	              <span class="word verdict" data-text="{verdict}"></span>
	              <span class="fig delta" data-text="{delta}"></span>
	              <span class="pair simulated" data-specimen="{specimen}" style="--left: {left_seen}; --right: {right_seen}; --ground: {ground}">
	                <span class="side side-left"><span class="chip"></span></span>
	                <span class="side side-right"><span class="chip"></span></span>
	              </span>
	            </li>
	          </template>
	        </ul>

	        <section class="declined">
	          <h2>Admitted by the rule and not graded</h2>
	          <ul data-live="opposition" data-filter="graded=eq.false" data-order="pos.asc"
	              data-empty="Every pair the rule admits is graded.">
	            <template data-item>
	              <li class="declined-row">
	                <span class="tok" data-text="{left_token}"></span>
	                <span class="word reason" data-text="{declined}"></span>
	              </li>
	            </template>
	          </ul>
	        </section>
	      </article>
	    </template>
	  </div>
	</section>
	"""

// --- 4. the pairing sheet --------------------------------------------------

_pairingsMarkup: """
	<section class="screen" data-screen="pairings">
	  <div class="root" data-live="theme" data-filter="id=eq.{param.theme}">
	    <template data-item>
	      <article class="sheet subject" data-theme="{id}" data-ground="{ground}"
	               \(_wearsSubject)>
	        <p class="back"><a data-route="theme" data-param-theme="{id}">‹ Its audit</a></p>
	        <h1>The pairing sheet — <span data-text="{id}"></span></h1>
	        <p class="note">Primer's published Logic Matrix, one row per obligation. Each row is drawn as the
	          text it would actually be, and carries its ratio and a verdict against BOTH published
	          thresholds: the tokens do not say which row of the table a muted ground under semantic ink
	          belongs to, and picking one would turn a measurement into an opinion.</p>
	        <p class="ways"><a data-route="spec">the thresholds, quoted</a></p>

	\(_seat)

	        <ul class="thresholds" data-live="floor" data-filter="applies=eq.ratio" data-order="pos.asc"
	            data-empty="No thresholds.">
	          <template data-item>
	            <li><span class="fig" data-text="{value}"></span> <span data-text="{says}"></span>
	              <span class="src" data-text="{source}"></span></li>
	          </template>
	        </ul>

	        <ul class="ratios" data-live="ratio" data-filter="theme=eq.{param.theme}" data-order="pairing.asc"
	            data-empty="No obligations.">
	          <template data-item>
	            <li class="ratio-row" data-ambiguous="{ambiguous}">
	              <span class="drawn-text" style="--ground: {ground_color}; --ink: {ink_color}">Aa the ink on its ground</span>
	              <span class="pairing-id" data-text="{pairing}"></span>
	              <span class="fig ratio" data-text="{ratio}"></span>
	              <span class="word v-text" data-text="{verdict_text}"></span>
	              <span class="word v-ui" data-text="{verdict_ui}"></span>
	              <span class="word filed" data-text="{ambiguous}"></span>
	            </li>
	          </template>
	        </ul>

	        <ul class="obligations" data-live="pairing" data-order="pos.asc" data-empty="No obligations.">
	          <template data-item>
	            <li class="obligation">
	              <span class="tok" data-text="{ground_token}"></span>
	              <span class="tok" data-text="{ink_token}"></span>
	              <span class="word klass" data-text="{klass}"></span>
	              <span class="fig filed" data-text="{threshold_filed}"></span>
	              <span class="word ambiguity" data-text="{ambiguous}"></span>
	            </li>
	          </template>
	        </ul>
	      </article>
	    </template>
	  </div>
	</section>
	"""

// --- 5. the declarations ---------------------------------------------------

_tokensMarkup: """
	<section class="screen" data-screen="tokens">
	  <div class="root" data-live="theme" data-filter="id=eq.{param.theme}">
	    <template data-item>
	      <article class="decls subject" data-theme="{id}" data-ground="{ground}"
	               \(_wearsSubject)>
	        <p class="back"><a data-route="theme" data-param-theme="{id}">‹ Its audit</a></p>
	        <h1>The declarations — <span data-text="{id}"></span></h1>
	        <p class="note">Every column the audit reads. The closure rule: every token whose name carries an
	          opposition segment, every token a published pairing names, every categorical chart colour, the
	          whole alias closure of those three in each theme, and one nominated theme — <code>light</code> —
	          entire. Everything outside that is named on the specification screen and not held here.</p>

	\(_seat)

	        <ul class="census" data-live="census" data-order="id.asc" data-empty="No census.">
	          <template data-item>
	            <li class="census-row">
	              <span class="fig count" data-text="{count}"></span>
	              <span class="fact" data-text="{fact}"></span>
	              <span class="says" data-text="{says}"></span>
	            </li>
	          </template>
	        </ul>

	        <ul class="tokens" data-live="token" data-filter="theme=eq.{param.theme}" data-order="name.asc"
	            data-empty="No declarations.">
	          <template data-item>
	            <li class="token-row" data-kind="{kind}" data-type="{type}">
	              <span class="tok name" data-text="{name}"></span>
	              <span class="word kind" data-text="{kind}"></span>
	              <span class="tok raw" data-text="{raw}"></span>
	              <span class="tok chain" data-text="{chain}"></span>
	              <span class="fig resolved" data-text="{resolved}"></span>
	              <span class="fig composited" data-text="{composited}"></span>
	              <span class="word type" data-text="{type}"></span>
	              <span class="describes" data-text="{describes}"></span>
	            </li>
	          </template>
	        </ul>
	      </article>
	    </template>
	  </div>
	</section>
	"""

// --- 6. the specification --------------------------------------------------

_specMarkup: """
	<section class="screen" data-screen="spec">
	  <header class="page-head">
	    <p class="back"><a data-route="roster">‹ The fourteen</a></p>
	    <h1>The specification</h1>
	    <p class="lede">The claim, this app's reading, and the verdict, in three columns and never merged into
	      one. A published sentence is set as a quotation because rewording it to match the app would be a
	      diff on something that is supposed to be a quotation.</p>
	  </header>

	\(_seat)

	  <section class="claims">
	    <h2>Claims</h2>
	    <ul data-live="claim" data-order="pos.asc" data-empty="No claims.">
	      <template data-item>
	        <!-- `data-verbatim`: a claim's words are quoted, and one of them quotes
	             Primer's pairing rule for semantic ink. The battery's rendered-text
	             scan cannot tell that from a binding it failed to resolve; the
	             interpreter's own leak set still can, and this says nothing to it. -->
	        <li class="claim" data-kind="{kind}" data-verbatim>
	          <blockquote class="says" data-text="{says}"></blockquote>
	          <p class="reads" data-text="{reads}"></p>
	          <p class="departs" data-text="{departs}"></p>
	          <p class="probe" data-text="{probe}"></p>
	        </li>
	      </template>
	    </ul>
	  </section>

	  <section class="typography">
	    <h2>The purposes this app names, and what naming them cost</h2>
	    <p class="note">The MENU is the platform's and the values are this app's, because
	      <code>press</code> ships an empty type bucket. A role wins its norm and <code>best</code> keeps one
	      step per dimension and norm, so every purpose whose value equals a vendored step's DROPS that step
	      from what this app's literal lint can name. The column below is read off the emitted stylesheet, not
	      written beside it.</p>
	    <ul class="type-rungs" data-live="type_rung" data-order="pos.asc" data-empty="This app names no type purpose.">
	      <template data-item>
	        <li class="type-row" data-dimension="{dimension}" data-shadows="{coincides}">
	          <span class="tok purpose" data-text="{purpose}"></span>
	          <span class="fig value" data-text="{value}"></span>
	          <span class="fig resolved" data-text="{resolved}"></span>
	          <span class="word dimension" data-text="{dimension}"></span>
	          <span class="tok coincides" data-text="{coincides}"></span>
	        </li>
	      </template>
	    </ul>
	  </section>

	  <section class="method">
	    <h2>The readers</h2>
	    <p class="note">A dichromat's world is not a filter over a trichromat's. Each matrix below is a
	      published model at one severity, and every simulated colour on any screen is marked as simulated.</p>
	    <ul class="reader-rows" data-live="reader" data-order="pos.asc" data-empty="No readers.">
	      <template data-item>
	        <li class="reader-row">
	          <span class="who" data-text="{name}"></span>
	          <span class="says" data-text="{says}"></span>
	          <span class="fig severity" data-text="{severity}"></span>
	          <span class="matrix">
	            <span class="fig" data-text="{m00}"></span><span class="fig" data-text="{m01}"></span><span class="fig" data-text="{m02}"></span>
	            <span class="fig" data-text="{m10}"></span><span class="fig" data-text="{m11}"></span><span class="fig" data-text="{m12}"></span>
	            <span class="fig" data-text="{m20}"></span><span class="fig" data-text="{m21}"></span><span class="fig" data-text="{m22}"></span>
	          </span>
	          <span class="citation" data-text="{citation}"></span>
	        </li>
	      </template>
	    </ul>

	    <h2>The floors</h2>
	    <ul class="floor-rows" data-live="floor" data-order="pos.asc" data-empty="No floors.">
	      <template data-item>
	        <li class="floor-row">
	          <span class="fig" data-text="{value}"></span>
	          <span class="word applies" data-text="{applies}"></span>
	          <span class="says" data-text="{says}"></span>
	          <span class="src" data-text="{source}"></span>
	        </li>
	      </template>
	    </ul>

	    <h2>The oppositions the rule admits</h2>
	    <p class="note">Two colour tokens are an opposition when their names differ in exactly one segment and
	      that segment is one of the six the vendor's own vocabulary opposes. Nothing is hand-listed.</p>
	    <ul class="segments" data-live="segment" data-order="pos.asc" data-empty="No segments.">
	      <template data-item>
	        <li class="segment-row">
	          <span class="tok" data-text="{left}"></span>
	          <span class="tok" data-text="{right}"></span>
	          <span class="says" data-text="{says}"></span>
	        </li>
	      </template>
	    </ul>

	    <h2>The count, and what of it is independent</h2>
	    <p class="note">Nineteen graded pairs across fourteen themes and four readings is 1,064 separations,
	      798 of them colour-vision-gated, beside 26 obligations across fourteen themes. The independent
	      information is smaller: the same few semantic families restated across the bgColor, borderColor,
	      fgColor, control and progressBar spellings move as blocks, so the genuinely independent signal is
	      closer to fourteen themes times five families times three simulations. A count that oversells itself
	      is the first thing a reviewer should be able to check.</p>
	    <ul class="census" data-live="census" data-order="id.asc" data-empty="No census.">
	      <template data-item>
	        <li class="census-row">
	          <span class="fig count" data-text="{count}"></span>
	          <span class="fact" data-text="{fact}"></span>
	          <span class="says" data-text="{says}"></span>
	        </li>
	      </template>
	    </ul>
	  </section>
	</section>
	"""
