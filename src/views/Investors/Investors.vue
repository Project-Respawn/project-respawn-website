<template>
  <main class="investors-page">
    <section class="investor-hero">
      <div class="investor-shell hero-grid">
        <div>
          <p class="investor-eyebrow">Project Respawn · Investor Overview</p>
          <h1>Building the gaming ecosystem around <span>human connection.</span></h1>
          <p class="hero-lede">
            Project Respawn is building a connected gaming, creator and media ecosystem designed to help
            people find community, build confidence and create opportunity.
          </p>
          <div class="hero-quote">
            <span>Your past is just the tutorial.</span>
            <strong>Your real game starts now.</strong>
          </div>
          <div class="hero-actions">
            <a href="#ecosystem" class="investor-btn investor-btn-primary">Explore the vision</a>
            <a href="#financials" class="investor-btn investor-btn-ghost">View financial scenarios</a>
          </div>
        </div>
        <aside class="hero-card" aria-label="Project Respawn investment thesis">
          <p class="hero-card-label">THE THESIS</p>
          <h2>One creator. One community. One ecosystem.</h2>
          <div class="thesis-list">
            <span>Free creator infrastructure</span>
            <span>Owned member experience</span>
            <span>Privacy protected evidence</span>
            <span>Multiple revenue engines</span>
          </div>
          <p class="hero-card-footnote">Long term expansion is earned through evidence, scale and economics.</p>
        </aside>
      </div>
    </section>

    <section class="investor-section">
      <div class="investor-shell">
        <header class="section-heading">
          <p class="section-kicker">The problem</p>
          <h2>Gaming communities are fragmented.</h2>
          <p>Creators and their audiences move between separate tools for streaming, community, moderation, memberships, commerce, overlays, analytics, events and sponsorship. Respawn is designed to connect that journey.</p>
        </header>
        <div class="problem-grid">
          <article v-for="problem in problems" :key="problem.title" class="glass-card">
            <span class="card-number">{{ problem.number }}</span>
            <h3>{{ problem.title }}</h3>
            <p>{{ problem.copy }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="distribution" class="investor-section investor-section-deep">
      <div class="investor-shell">
        <header class="section-heading section-heading-wide">
          <p class="section-kicker">Our initial wedge</p>
          <h2>We do not intend to buy our audience. We intend to give creators a reason to bring them.</h2>
          <p>
            Project Respawn's core Creator Tools are designed as a product-led distribution engine.
            Instead of depending primarily on paid consumer advertising, we aim to invest in useful creator
            infrastructure that helps creators run their communities and naturally introduces those communities to Respawn.
          </p>
        </header>

        <div class="wedge-layout">
          <div class="creator-tool-cloud">
            <span>Twitch</span><span>Discord</span><span>Moderation</span><span>Commands</span>
            <span>Alerts</span><span>TTS</span><span>OBS overlays</span><span>Unified chat</span>
            <span>Community</span><span>Rewards</span><span>Events</span><span>Achievements</span>
            <span>Members</span><span>Analytics</span><span>Automation</span>
          </div>

          <div class="distribution-flow" aria-label="Creator-led distribution model">
            <article><small>01</small><strong>Useful free Creator Tools</strong><p>Replace or consolidate fragmented creator infrastructure.</p></article>
            <span>→</span>
            <article><small>02</small><strong>Creators adopt Respawn</strong><p>Acquire creators through product value, outreach, referrals and selective launch partnerships.</p></article>
            <span>→</span>
            <article><small>03</small><strong>Communities discover Respawn</strong><p>Creator audiences enter a shared identity, community and progression ecosystem.</p></article>
            <span>→</span>
            <article><small>04</small><strong>Network + monetisation</strong><p>Memberships, commerce, brands and publisher services grow around demonstrated participation.</p></article>
          </div>
        </div>

        <div class="strategy-callout">
          <strong>Acquisition spend is not assumed to disappear.</strong>
          <p>
            The hypothesis is that product value can carry more of the acquisition burden than recurring paid advertising.
            Engineering, infrastructure, support, onboarding and selective creator partnerships still create real acquisition
            and operating costs, and must ultimately be justified by retention and lifetime value.
          </p>
        </div>
      </div>
    </section>

    <section id="creator-score" class="investor-section">
      <div class="investor-shell">
        <header class="section-heading">
          <p class="section-kicker">Creator Score</p>
          <h2>Followers measure audience size. Respawn wants to understand community strength.</h2>
          <p>
            Creator Score is a proposed community-development layer intended to combine permissioned signals around
            participation, retention, growth and engagement. Its first purpose is to give creators useful, personalised
            recommendations for strengthening their communities.
          </p>
        </header>

        <div class="score-flow">
          <div class="score-inputs">
            <span>Participation</span><span>Retention</span><span>Growth</span>
            <span>Engagement</span><span>Community activity</span><span>Respawn activity</span>
          </div>
          <div class="score-core">
            <small>Proposed intelligence layer</small>
            <strong>CREATOR<br />SCORE</strong>
          </div>
          <div class="score-outputs">
            <article><strong>Creator recommendations</strong><p>Private guidance intended to improve engagement and community development.</p></article>
            <article><strong>Community learning</strong><p>Understand which interventions correlate with stronger participation and retention.</p></article>
            <article><strong>Commercial matching</strong><p>Develop privacy-protected ways to identify relevant opportunities without exposing unrestricted creator analytics.</p></article>
          </div>
        </div>

        <div class="principle-grid">
          <article v-for="principle in creatorScorePrinciples" :key="principle.title">
            <h3>{{ principle.title }}</h3>
            <p>{{ principle.copy }}</p>
          </article>
        </div>

        <div class="strategy-callout score-warning">
          <strong>Creator Score is a methodology to be validated, not a claim of objective creator quality.</strong>
          <p>
            Exact weightings, anti-manipulation controls and proprietary methodology do not need to be public.
            Detailed methodology can instead be shared with verified investors during deeper diligence.
          </p>
        </div>
      </div>
    </section>

    <section id="ecosystem" class="investor-section investor-section-deep">
      <div class="investor-shell">
        <header class="section-heading section-heading-center">
          <p class="section-kicker">The ecosystem</p>
          <h2>Project Respawn connects the journey.</h2>
          <p>Select a layer to see how it fits into the long term model.</p>
        </header>
        <div class="ecosystem-layout">
          <div class="ecosystem-map" role="list" aria-label="Project Respawn ecosystem">
            <button v-for="item in ecosystemItems" :key="item.key" type="button" class="ecosystem-node" :class="{ active: activeEcosystem.key === item.key }" @click="activeEcosystemKey = item.key">
              <span>{{ item.label }}</span><small>{{ item.stage }}</small>
            </button>
            <div class="ecosystem-core"><span>PROJECT</span><strong>RESPAWN</strong></div>
          </div>
          <aside class="detail-panel">
            <p class="detail-stage">{{ activeEcosystem.stage }}</p>
            <h3>{{ activeEcosystem.label }}</h3>
            <p>{{ activeEcosystem.copy }}</p>
          </aside>
        </div>
      </div>
    </section>

    <section class="investor-section">
      <div class="investor-shell">
        <div class="split-section">
          <div>
            <p class="section-kicker">Creator acquisition</p>
            <h2>Creators are partners in the ecosystem, not software subscriptions.</h2>
            <p class="large-copy">Project Respawn intends to make its core creator infrastructure free. The commercial model is designed around the economy that grows around creators rather than forcing essential tools behind a monthly paywall.</p>
            <p class="principle">Project Respawn should earn more when creators and communities create more value.</p>
          </div>
          <div class="flywheel-card" aria-label="Project Respawn growth flywheel">
            <p class="flywheel-title">THE RESPAWN FLYWHEEL</p>
            <ol class="flywheel-list">
              <li v-for="(step, index) in flywheel" :key="step"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ step }}</strong></li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <section class="investor-section investor-section-deep">
      <div class="investor-shell">
        <header class="section-heading">
          <p class="section-kicker">Business model</p>
          <h2>Multiple reinforcing revenue engines.</h2>
          <p>The company is designed to diversify rather than depend on a single subscription or esports market.</p>
        </header>
        <div class="revenue-layout">
          <div class="revenue-tabs" role="tablist" aria-label="Revenue engines">
            <button v-for="engine in revenueEngines" :key="engine.key" type="button" :class="{ active: activeRevenue.key === engine.key }" @click="activeRevenueKey = engine.key">{{ engine.label }}</button>
          </div>
          <div class="revenue-detail">
            <p class="section-kicker">Selected engine</p>
            <h3>{{ activeRevenue.label }}</h3>
            <p>{{ activeRevenue.copy }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="investor-section mission-section">
      <div class="investor-shell">
        <header class="section-heading section-heading-center">
          <p class="section-kicker">Mission at scale</p>
          <h2>Gaming is the environment. Human connection is the objective.</h2>
          <p>Project Respawn launches as a gaming and community product, not as a medical treatment. The long term research ambition must be earned independently.</p>
        </header>
        <div class="journey" aria-label="Illustrative social confidence journey">
          <template v-for="(step, index) in confidenceJourney" :key="step">
            <span class="journey-step">{{ step }}</span><span v-if="index < confidenceJourney.length - 1" class="journey-arrow" aria-hidden="true">→</span>
          </template>
        </div>
        <div class="mission-notes">
          <article class="glass-card"><h3>Research first</h3><p>Independent university backed research is intended around Years 2–3 if early evidence supports doing so.</p></article>
          <article class="glass-card"><h3>No premature claims</h3><p>Treatment claims or a dedicated health pathway only follow if evidence and relevant regulation justify them.</p></article>
          <article class="glass-card"><h3>Mission protected</h3><p>Commercial scale should make the social confidence mission more visible, not turn it into a footnote.</p></article>
        </div>
      </div>
    </section>

    <section class="investor-section investor-section-deep">
      <div class="investor-shell">
        <header class="section-heading">
          <p class="section-kicker">Competitive position</p>
          <h2>Crowded parts. Open intersection.</h2>
          <p>Strong incumbents already lead individual categories. Respawn's opportunity is connecting creator infrastructure, gaming identity, community participation, progression, memberships and measurable outcomes into one first party ecosystem.</p>
        </header>
        <div class="position-grid">
          <article v-for="item in positions" :key="item.area" class="position-card"><span>{{ item.area }}</span><p>{{ item.angle }}</p></article>
        </div>
      </div>
    </section>

    <section id="financials" class="investor-section">
      <div class="investor-shell">
        <header class="section-heading">
          <p class="section-kicker">Financial outlook</p>
          <h2>See not only how Respawn could grow, but where the revenue comes from.</h2>
          <p>
            Select a scenario and year to explore the illustrative revenue mix. Each colour represents a
            different income stream and the table below reconciles directly to the selected annual total.
          </p>
        </header>

        <div class="scenario-tabs" role="tablist" aria-label="Financial scenarios">
          <button
            v-for="(scenario, key) in scenarios"
            :key="key"
            type="button"
            :class="{ active: activeScenarioKey === key }"
            @click="activeScenarioKey = key"
          >
            <span>{{ scenario.label }}</span>
            <small>{{ scenario.tone }}</small>
          </button>
        </div>

        <div class="financial-grid financial-grid-wide">
          <div class="chart-card">
            <div class="chart-head">
              <div>
                <p class="section-kicker">Annual revenue composition</p>
                <h3>{{ activeScenario.label }}</h3>
              </div>
              <div class="year-highlight">
                <span>Selected: Year {{ selectedYear + 1 }}</span>
                <strong>{{ formatRevenue(activeScenario.totals[selectedYear]) }}</strong>
              </div>
            </div>

            <div class="revenue-legend" aria-label="Revenue stream legend">
              <button
                v-for="stream in revenueStreams"
                :key="stream.key"
                type="button"
                class="legend-item"
                :class="[stream.className, { active: highlightedStream === stream.key }]"
                @click="toggleStream(stream.key)"
              >
                <span class="legend-swatch" aria-hidden="true"></span>
                <span>
                  <strong>{{ stream.label }}</strong>
                  <small>{{ stream.stage }}</small>
                </span>
              </button>
            </div>

            <div class="stacked-chart" aria-label="Illustrative annual revenue composition chart">
              <button
                v-for="(total, yearIndex) in activeScenario.totals"
                :key="`${activeScenarioKey}-${yearIndex}`"
                class="stacked-column"
                :class="{ selected: selectedYear === yearIndex }"
                type="button"
                :aria-label="`Year ${yearIndex + 1}, ${formatRevenue(total)}`"
                @click="selectedYear = yearIndex"
              >
                <span class="stacked-total">{{ formatRevenue(total) }}</span>
                <span class="stacked-bar-shell">
                  <span
                    v-for="stream in revenueStreams"
                    :key="`${stream.key}-${yearIndex}`"
                    class="stacked-segment"
                    :class="[
                      stream.className,
                      {
                        muted: highlightedStream && highlightedStream !== stream.key,
                        focused: highlightedStream === stream.key
                      }
                    ]"
                    :style="{ height: `${segmentHeight(stream.key, yearIndex)}%` }"
                    :title="`${stream.label}: ${formatRevenue(streamValue(stream.key, yearIndex))}`"
                  ></span>
                </span>
                <span class="chart-year">Y{{ yearIndex + 1 }}</span>
              </button>
            </div>

            <p class="chart-note">
              Bar heights use a logarithmic scale so early stage and mature years remain readable together.
              Segment proportions represent the selected scenario's illustrative revenue mix.
            </p>
          </div>

          <aside class="scenario-summary">
            <p class="detail-stage">{{ activeScenario.tone }}</p>
            <h3>{{ formatRevenue(activeScenario.totals[9]) }} Year 10</h3>
            <p>{{ activeScenario.description }}</p>

            <div v-if="highlightedRevenueStream" class="stream-focus">
              <p class="detail-stage">Revenue stream focus</p>
              <h4>{{ highlightedRevenueStream.label }}</h4>
              <p>{{ revenueStreamDescription(highlightedRevenueStream.key) }}</p>
            </div>

            <div class="scenario-warning">
              <strong>Important</strong>
              <p>
                These are illustrative strategic planning scenarios, not forecasts, guarantees or investment advice.
                Conditional revenue only appears once the relevant evidence, scale and economics are assumed to exist.
              </p>
            </div>
          </aside>
        </div>

        <div class="revenue-amount-grid" aria-label="Selected year revenue mix">
          <article
            v-for="stream in selectedRevenueRows"
            :key="`amount-${stream.key}`"
            class="revenue-amount-card"
            :class="stream.className"
          >
            <div class="revenue-amount-topline">
              <span class="legend-swatch" aria-hidden="true"></span>
              <small>{{ stream.stage }}</small>
            </div>
            <strong>{{ formatRevenue(stream.value) }}</strong>
            <span>{{ stream.label }}</span>
            <small>{{ stream.share.toFixed(1) }}% of selected year revenue</small>
          </article>
        </div>

        <div class="financial-table-card">
          <div class="table-heading">
            <div>
              <p class="section-kicker">Selected year breakdown</p>
              <h3>Year {{ selectedYear + 1 }} · {{ activeScenario.label }}</h3>
            </div>
            <strong>{{ formatRevenue(activeScenario.totals[selectedYear]) }} total</strong>
          </div>

          <div class="financial-table-wrap">
            <table class="financial-table">
              <thead>
                <tr>
                  <th scope="col">Revenue engine</th>
                  <th scope="col">Stage</th>
                  <th scope="col">What drives it</th>
                  <th scope="col">Illustrative revenue</th>
                  <th scope="col">Share</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stream in selectedRevenueRows" :key="stream.key">
                  <td>
                    <span class="table-stream">
                      <span class="legend-swatch" :class="stream.className" aria-hidden="true"></span>
                      <strong>{{ stream.label }}</strong>
                    </span>
                  </td>
                  <td>{{ stream.stage }}</td>
                  <td class="driver-cell">{{ revenueDriver(stream.key) }}</td>
                  <td>{{ formatRevenue(stream.value) }}</td>
                  <td>{{ stream.share.toFixed(1) }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colspan="3">Total</th>
                  <th>{{ formatRevenue(activeScenario.totals[selectedYear]) }}</th>
                  <th>100%</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>

    <section class="investor-section investor-section-deep">
      <div class="investor-shell">
        <header class="section-heading"><p class="section-kicker">Roadmap</p><h2>Earn each expansion.</h2><p>Project Respawn should not attempt to build the final ecosystem at launch.</p></header>
        <div class="roadmap">
          <article v-for="item in roadmap" :key="item.period" class="roadmap-item"><span>{{ item.period }}</span><div><h3>{{ item.title }}</h3><p>{{ item.copy }}</p></div></article>
        </div>
      </div>
    </section>

    <section class="investor-section ambition-section">
      <div class="investor-shell">
        <div class="ambition-hero"><p class="section-kicker">Long term ambition</p><h2>And if we succeed...</h2><p class="ambition-lede">Give the digital ecosystem a physical home: a landmark London gaming destination built around a purpose designed esports arena and public gaming complex.</p></div>
        <div class="ambition-grid">
          <span>25,000 capacity esports first arena</span><span>Respawn Labs testing and reveal facilities</span><span>Creator and broadcast studios</span><span>Professional esports performance centre</span><span>Public gaming and hospitality</span><span>Offices and accommodation</span><span>Fitness and wellness</span><span>Public and private rooftop experiences</span>
        </div>
        <div class="long-term-warning"><strong>Long term ambition only.</strong><span>Not a funded development project and not included in near term investor capital requirements.</span></div>
      </div>
    </section>

    <section class="investor-section">
      <div class="investor-shell">
        <div class="governance-grid">
          <div><p class="section-kicker">Governance & trust</p><h2>What Project Respawn will not do.</h2></div>
          <ul><li>Sell unrestricted member level data to brands.</li><li>Present a Creator Score as proven truth before validation.</li><li>Claim to treat social anxiety before independent evidence and regulatory requirements support that claim.</li><li>Force creators to pay for core tooling merely because they become successful.</li><li>Bet the operating company on capital intensive streaming or physical infrastructure before economics are proven.</li></ul>
        </div>
      </div>
    </section>

    <section class="investor-section proof-section">
      <div class="investor-shell">
        <header class="section-heading"><p class="section-kicker">The investment case</p><h2>What must be proven next.</h2></header>
        <ol class="proof-list"><li v-for="(point, index) in proofPoints" :key="point"><span>{{ String(index + 1).padStart(2, '0') }}</span><p>{{ point }}</p></li></ol>
        <blockquote>Build something people genuinely enjoy using that helps them connect — then earn the right to become the global platform, media company and physical destination described in the long term vision.</blockquote>
      </div>
    </section>
    <section id="investor-information" class="investor-section investor-section-deep">
      <div class="investor-shell">
        <header class="section-heading">
          <p class="section-kicker">Investor information</p>
          <h2>Want to go deeper?</h2>
          <p>
            The public overview is designed to explain the investment thesis without publishing every proprietary,
            commercially sensitive or diligence-level assumption. Select the areas you would like to explore further.
          </p>
        </header>

        <div class="info-request-grid">
          <button
            v-for="item in investorInfoOptions"
            :key="item.key"
            type="button"
            class="info-request-card"
            :class="{ selected: investorInfoSelections.includes(item.key) }"
            @click="toggleInvestorInfo(item.key)"
          >
            <span class="info-check">{{ investorInfoSelections.includes(item.key) ? '✓' : '+' }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.copy }}</p>
          </button>
        </div>

        <div class="info-request-action">
          <div>
            <strong>{{ investorInfoSelections.length || 'No' }} area{{ investorInfoSelections.length === 1 ? '' : 's' }} selected</strong>
            <p>Detailed information can be shared at the appropriate diligence stage and, where necessary, under NDA.</p>
          </div>
          <button type="button" class="investor-primary-button" @click="requestInvestorInfo">
            Request investor information
          </button>
        </div>
      </div>
    </section>

  </main>
</template>

<script>
import {
  confidenceJourney,
  ecosystemItems,
  revenueEngines,
  revenueStreams,
  roadmap,
  scenarios
} from './investorData.js';

export default {
  name: 'Investors',
  data() {
    return {
      ecosystemItems,
      revenueEngines,
      revenueStreams,
      roadmap,
      scenarios,
      confidenceJourney,
      activeEcosystemKey: 'creator-tools',
      activeRevenueKey: 'memberships',
      activeScenarioKey: 'base',
      selectedYear: 9,
      highlightedStream: null,
      investorInfoSelections: [],
      investorInfoOptions: [
        { key: 'creator-score', title: 'Creator Score & methodology', copy: 'Proposed inputs, privacy principles, anti-gaming design, validation and commercial applications.' },
        { key: 'creator-tools', title: 'Creator Tools & acquisition', copy: 'Product roadmap, creator onboarding, distribution hypothesis and infrastructure economics.' },
        { key: 'financial-model', title: 'Financial model', copy: 'Bottom-up assumptions behind memberships, brands, commerce, Labs, enterprise and scenario construction.' },
        { key: 'research', title: 'Social confidence & research', copy: 'Evidence roadmap, proposed independent research and the boundaries around future health claims.' },
        { key: 'technology', title: 'Technology & data', copy: 'Architecture, first-party data strategy, privacy, security and external platform dependencies.' },
        { key: 'commercial', title: 'Commercial strategy', copy: 'Membership economics, publisher proposition, brand partnerships and Respawn Labs.' },
        { key: 'roadmap', title: 'Roadmap & funding', copy: 'Milestones, hiring priorities, capital requirements and what future investment is intended to unlock.' }
      ],
      creatorScorePrinciples: [
        { title: 'Purpose before vanity', copy: 'The score is intended to help creators understand and strengthen community participation, not simply reward audience size.' },
        { title: 'Creator-controlled detail', copy: 'Detailed creator analytics remain private to the creator rather than becoming a public leaderboard of sensitive performance data.' },
        { title: 'Permissioned signals', copy: 'The model is intended to use appropriate, permissioned signals from the Respawn ecosystem and connected platforms.' },
        { title: 'Anti-gaming by design', copy: 'The methodology should reward sustainable community behaviour and evolve as manipulation patterns are identified.' },
        { title: 'Evidence-led iteration', copy: 'Weightings and recommendations should be tested against real outcomes rather than presented as an objective truth from day one.' }
      ],
      flywheel: [
        'Free Creator Tools',
        'More Creators',
        'More Communities',
        'More Members',
        'Membership + Commerce',
        'Brands + Publishers',
        'Creator Earnings',
        'More Creators'
      ],
      problems: [
        { number: '01', title: 'Creator fragmentation', copy: 'Creators assemble their business from disconnected streaming, community, moderation and monetisation tools.' },
        { number: '02', title: 'Member fragmentation', copy: 'Audiences repeatedly move between platforms with little shared identity, progression or context.' },
        { number: '03', title: 'Incomplete measurement', copy: 'Brands can measure reach but often struggle to understand what communities actually do after exposure.' },
        { number: '04', title: 'A human problem', copy: 'People who find social interaction difficult need lower pressure, structured ways to participate and build confidence.' }
      ],
      positions: [
        { area: 'Membership platforms', angle: 'Membership tied to gaming identity, progression and community behaviour.' },
        { area: 'Creator tools', angle: 'Free core tools connected to an owned member ecosystem.' },
        { area: 'Creator intelligence', angle: 'Gaming community depth and first party participation evidence.' },
        { area: 'Gaming attribution', angle: 'Community journey before and after conversion.' },
        { area: 'Community intelligence', angle: 'Gaming native identity plus member value exchange.' },
        { area: 'Research platforms', angle: 'Relevant opted in gaming audience plus first party participation context.' }
      ],
      proofPoints: [
        'Prove that creators adopt and retain the free Creator Tools suite.',
        'Prove that creator audiences become active Respawn members.',
        'Prove that memberships, campaigns and commerce can generate sustainable economics.',
        'Prove that first party evidence changes a real brand or publisher decision.',
        'Establish the research foundation to test the social confidence hypothesis independently.',
        'Scale only the layers that demonstrate repeatable user value and economics.'
      ]
    };
  },
  computed: {
    activeEcosystem() {
      return this.ecosystemItems.find((item) => item.key === this.activeEcosystemKey) || this.ecosystemItems[0];
    },
    activeRevenue() {
      return this.revenueEngines.find((item) => item.key === this.activeRevenueKey) || this.revenueEngines[0];
    },
    activeScenario() {
      return this.scenarios[this.activeScenarioKey];
    },
    selectedRevenueRows() {
      const total = this.activeScenario.totals[this.selectedYear] || 0;
      const mix = this.activeScenario.mix[this.selectedYear] || {};

      return this.revenueStreams.map((stream) => {
        const value = mix[stream.key] || 0;
        return {
          ...stream,
          value,
          share: total > 0 ? (value / total) * 100 : 0
        };
      });
    },
    highlightedRevenueStream() {
      return this.revenueStreams.find((stream) => stream.key === this.highlightedStream) || null;
    }
  },
  watch: {
    activeScenarioKey() {
      this.selectedYear = 9;
      this.highlightedStream = null;
    }
  },
  methods: {
    formatRevenue(value) {
      if (value >= 1000) return `£${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 2)}bn`;
      if (value >= 1) return `£${Number.isInteger(value) ? value : value.toFixed(1)}m`;
      if (value >= 0.1) return `£${Math.round(value * 1000)}k`;
      return `£${Math.round(value * 1000000).toLocaleString('en-GB')}`;
    },
    streamValue(streamKey, yearIndex) {
      return this.activeScenario.mix[yearIndex]?.[streamKey] || 0;
    },
    segmentHeight(streamKey, yearIndex) {
      const total = this.activeScenario.totals[yearIndex] || 0;
      if (!total) return 0;
      return (this.streamValue(streamKey, yearIndex) / total) * 100;
    },
    toggleStream(streamKey) {
      this.highlightedStream = this.highlightedStream === streamKey ? null : streamKey;
    },
    revenueDriver(streamKey) {
      const drivers = {
        memberships: 'Active members × paid conversion × average revenue per paying member',
        brands: 'Campaign volume × average campaign value × Respawn economics',
        commerce: 'Transaction volume × average order value × Respawn take rate',
        labs: 'Publisher clients × engagements per client × average engagement value',
        enterprise: 'Enterprise customers × average annual contract value',
        live: 'Events × attendance / commercial inventory × average event economics',
        media: 'Audience scale × monetisable viewing / advertising economics',
        health: 'Eligible customers or institutions × validated service economics',
        other: 'Only newly validated revenue engines are included as they emerge'
      };
      return drivers[streamKey] || '';
    },
    toggleInvestorInfo(key) {
      const index = this.investorInfoSelections.indexOf(key);
      if (index >= 0) this.investorInfoSelections.splice(index, 1);
      else this.investorInfoSelections.push(key);
    },
    requestInvestorInfo() {
      const topics = this.investorInfoOptions
        .filter((item) => this.investorInfoSelections.includes(item.key))
        .map((item) => item.title)
        .join(', ');
      const subject = encodeURIComponent('Project Respawn investor information request');
      const body = encodeURIComponent(
        `Hello Project Respawn,\n\nI would like to request additional investor information${topics ? ` on: ${topics}` : ''}.\n\nName:\nCompany / fund:\nRole:\n\nMessage:\n`
      );
      window.location.href = `mailto:contact@projectrespawn.com?subject=${subject}&body=${body}`;
    },
    revenueStreamDescription(streamKey) {
      const descriptions = {
        memberships: 'Single Creator and All Access membership economics built around recurring community support and access.',
        brands: 'Creator campaigns, sponsorships and measurable activations where Respawn acts as the commercial intermediary.',
        commerce: 'Affiliate, marketplace, merchandise and transaction revenue connected to the wider gaming ecosystem.',
        labs: 'Publisher research, playtests, closed betas, player panels, previews, reveals and launch activations.',
        enterprise: 'Organisation controls, APIs, services and intelligence for agencies, esports organisations and other larger partners.',
        live: 'Events, sponsorship, hospitality and media rights from esports and live entertainment activity.',
        media: 'Advertising, discovery and streaming economics. This remains conditional on scale and sustainable video infrastructure economics.',
        health: 'Potential institutional or consumer health revenue only after independent evidence and relevant regulatory requirements support a dedicated pathway.',
        other: 'New validated income streams that emerge as the ecosystem grows. This is intentionally kept small and non specific in the model.'
      };
      return descriptions[streamKey] || '';
    }
  }
};
</script>

<style scoped src="./Investors.css"></style>
