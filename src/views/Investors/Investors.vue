<template>
  <main class="investors-page">
    <section id="overview" class="investor-hero investor-anchor">
      <div class="investor-shell hero-layout">
        <div class="hero-copy">
          <p class="investor-eyebrow">Project Respawn · Current Pre Seed Fundraise</p>
          <h1>Building the creator ecosystem around <span>human connection.</span></h1>
          <p class="hero-lede">
            Project Respawn is launching commercially in November 2026 and raising £300,000 to fund an
            18 month execution plan from creator validation through repeatable community and commercial growth.
          </p>

          <div class="headline-stat-grid">
            <article v-for="stat in headlineStats" :key="stat.label" class="headline-stat">
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </article>
          </div>

          <div class="hero-actions">
            <a href="#product" class="investor-btn investor-btn-primary">Explore the investment case</a>
            <a href="#raise" class="investor-btn investor-btn-ghost">View the raise</a>
          </div>
        </div>

        <aside class="hero-card" aria-label="Project Respawn investment thesis">
          <p class="hero-card-label">THE INVESTMENT THESIS</p>
          <h2>One creator. One community. One ecosystem.</h2>
          <div class="thesis-list">
            <span v-for="point in thesisPoints" :key="point">{{ point }}</span>
          </div>
          <p class="hero-card-footnote">Long term expansion is earned through evidence, scale and economics.</p>
        </aside>
      </div>
    </section>

    <div class="investor-shell investor-body-layout">
      <aside class="investor-index" :class="{ open: mobileIndexOpen }">
        <button type="button" class="index-mobile-toggle" @click="mobileIndexOpen = !mobileIndexOpen">
          <span>Investor overview</span>
          <strong>{{ mobileIndexOpen ? '×' : '☰' }}</strong>
        </button>

        <div class="index-panel">
          <div class="index-heading">
            <small>INVESTOR INDEX</small>
            <span>{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(investorNavigation.length).padStart(2, '0') }}</span>
          </div>
          <nav aria-label="Investor page sections">
            <a
              v-for="(item, index) in investorNavigation"
              :key="item.id"
              :href="`#${item.id}`"
              :class="{ active: activeSection === item.id }"
              @click="mobileIndexOpen = false"
            >
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <strong>{{ item.label }}</strong>
            </a>
          </nav>
          <a href="#raise" class="index-cta">Current raise · £300k</a>
        </div>
      </aside>

      <div class="investor-content">
        <section id="problem" class="investor-section investor-anchor">
          <header class="section-heading">
            <p class="section-kicker">The problem</p>
            <h2>Creators build communities across fragmented systems.</h2>
            <p>Project Respawn is designed around the opportunity created when creator tools, community identity, participation, monetisation and commercial evidence are connected.</p>
          </header>

          <div class="problem-grid">
            <article v-for="problem in problems" :key="problem.number" class="glass-card">
              <span class="card-number">{{ problem.number }}</span>
              <h3>{{ problem.title }}</h3>
              <p>{{ problem.copy }}</p>
            </article>
          </div>
        </section>

        <section id="product" class="investor-section investor-section-deep investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">The product</p>
            <h2>Project Respawn connects the creator and community journey.</h2>
            <p>The launch product starts with practical creator infrastructure, then builds an owned community and commercial layer around the resulting network.</p>
          </header>

          <div class="ecosystem-layout">
            <div class="ecosystem-map" role="list" aria-label="Project Respawn ecosystem">
              <button
                v-for="item in productLayers"
                :key="item.key"
                type="button"
                class="ecosystem-node"
                :class="{ active: activeProductKey === item.key }"
                @click="activeProductKey = item.key"
              >
                <span>{{ item.label }}</span>
                <small>{{ item.stage }}</small>
              </button>
              <div class="ecosystem-core"><span>PROJECT</span><strong>RESPAWN</strong></div>
            </div>

            <aside class="detail-panel">
              <p class="detail-stage">{{ activeProduct.stage }}</p>
              <h3>{{ activeProduct.label }}</h3>
              <p>{{ activeProduct.copy }}</p>
            </aside>
          </div>
        </section>

        <section id="creator-tools" class="investor-section investor-anchor">
          <div class="split-section">
            <div>
              <p class="section-kicker">Creator Tools</p>
              <h2>Our first distribution wedge is useful infrastructure.</h2>
              <p class="large-copy">
                We do not intend to buy every member through consumer advertising. The initial hypothesis is that creators adopt useful free tools and bring their existing communities into Respawn through events, rewards and shared participation.
              </p>
              <p class="principle">The creator should have a reason to use Respawn before we ever ask their community to join it.</p>
            </div>

            <div class="creator-tool-cloud" aria-label="Creator Tools launch areas">
              <span v-for="tool in creatorTools" :key="tool">{{ tool }}</span>
            </div>
          </div>

          <div class="distribution-flow">
            <article><small>01</small><strong>Useful free Creator Tools</strong><p>Reduce fragmented workflows across Twitch, Discord and OBS.</p></article>
            <span>→</span>
            <article><small>02</small><strong>Creator adopts Respawn</strong><p>Selective recruitment, events, partnerships and referrals build the creator network.</p></article>
            <span>→</span>
            <article><small>03</small><strong>Community joins experiences</strong><p>Quests, events, rewards and creator led activity introduce audiences to Respawn.</p></article>
            <span>→</span>
            <article><small>04</small><strong>Network value compounds</strong><p>Discovery, memberships, brands and commerce grow around demonstrated participation.</p></article>
          </div>
        </section>

        <section id="creator-score" class="investor-section investor-section-deep investor-anchor">
          <header class="section-heading">
            <p class="section-kicker">Creator Score</p>
            <h2>Followers measure audience size. Respawn wants to understand community strength.</h2>
            <p>Creator Score is a proposed intelligence layer intended to combine permissioned participation, retention, growth and engagement signals into useful recommendations and commercial evidence.</p>
          </header>

          <div class="score-flow">
            <div class="score-inputs">
              <span>Participation</span><span>Retention</span><span>Growth</span><span>Engagement</span><span>Community activity</span><span>Respawn activity</span>
            </div>
            <div class="score-core"><small>PROPOSED INTELLIGENCE LAYER</small><strong>CREATOR<br />SCORE</strong></div>
            <div class="score-outputs">
              <article><strong>Creator recommendations</strong><p>Private guidance designed to improve engagement and community development.</p></article>
              <article><strong>Community learning</strong><p>Measure which interventions correlate with stronger participation and retention.</p></article>
              <article><strong>Commercial matching</strong><p>Help brands identify relevant creator communities without exposing unrestricted member level data.</p></article>
            </div>
          </div>

          <div class="principle-grid">
            <article v-for="principle in creatorScorePrinciples" :key="principle.title">
              <h3>{{ principle.title }}</h3>
              <p>{{ principle.copy }}</p>
            </article>
          </div>

          <div class="strategy-callout score-warning">
            <strong>Creator Score is a methodology to validate, not a claim of objective creator quality.</strong>
            <p>Exact weightings, anti manipulation controls and proprietary methodology can be shared at the appropriate diligence stage.</p>
          </div>
        </section>

        <section id="growth" class="investor-section investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">Growth engine</p>
            <h2>Creators are the first distribution channel. Events make the network visible.</h2>
            <p>Creator acquisition spend is intended to create reusable ecosystem value through event partnerships, creator collaborations, community competitions and selective strategic relationships.</p>
          </header>

          <div class="growth-layout">
            <div class="flywheel-card">
              <p class="flywheel-title">THE RESPAWN GROWTH LOOP</p>
              <ol class="flywheel-list">
                <li v-for="(step, index) in growthFlywheel" :key="step"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ step }}</strong></li>
              </ol>
            </div>

            <div class="event-example-card">
              <p class="detail-stage">Example community activation</p>
              <h3>First community to 100 League wins.</h3>
              <p>Creators activate their communities through Twitch, Discord and Respawn. Rewards can include creator bonuses, community prizes, tokens, badges or low marginal cost pet cosmetics.</p>
              <div class="event-value-grid">
                <span>Member acquisition</span><span>Creator retention</span><span>Community engagement</span><span>Social content</span><span>Creator Score data</span><span>Sponsor inventory</span>
              </div>
            </div>
          </div>

          <div class="target-grid">
            <article v-for="target in executionTargets.slice(0, 4)" :key="target.label">
              <strong>{{ target.value }}</strong><span>{{ target.label }}</span><small>{{ target.detail }}</small>
            </article>
          </div>
        </section>

        <section id="creator-partnership" class="investor-section investor-section-deep investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">Creator partnership</p>
            <h2>From creator tool to sustainable creator career.</h2>
            <p>The objective is not simply to take a percentage of existing creator income. It is to increase the total economic opportunity available to the creator and progressively reduce income volatility for proven relationships.</p>
          </header>

          <div class="creator-pathway">
            <article v-for="(stage, index) in creatorPathway" :key="`${stage.stage}-${stage.title}`" class="pathway-card">
              <div class="pathway-topline"><span>{{ stage.stage }}</span><small>{{ stage.badge }}</small></div>
              <h3>{{ stage.title }}</h3>
              <p>{{ stage.copy }}</p>
              <span v-if="index < creatorPathway.length - 1" class="pathway-arrow" aria-hidden="true">→</span>
            </article>
          </div>

          <div class="creator-career-callout">
            <strong>A creator should eventually be able to take a holiday without their agreed income disappearing.</strong>
            <p>At sufficient network scale, Respawn can use portfolio level cash flow and community continuity to support more predictable creator contracts and, where sustainable, genuine salaried relationships.</p>
          </div>
        </section>

        <section id="memberships" class="investor-section investor-anchor">
          <header class="section-heading">
            <p class="section-kicker">Membership network</p>
            <h2>Support your favourites. Explore everyone.</h2>
            <p>Direct creator support and Respawn Plus are independent choices. A member can support multiple creators at different tiers while separately choosing the network access level they want.</p>
          </header>

          <div class="membership-columns">
            <div class="membership-column">
              <div class="membership-column-head"><small>DIRECT CREATOR SUPPORT</small><h3>Who you support</h3></div>
              <article v-for="tier in directMemberships" :key="tier.name" class="membership-tier">
                <div><strong>{{ tier.name }}</strong><span>{{ tier.price }}</span></div><p>{{ tier.copy }}</p>
              </article>
            </div>
            <div class="membership-column plus-column">
              <div class="membership-column-head"><small>OPTIONAL NETWORK ACCESS</small><h3>What you can explore</h3></div>
              <article v-for="tier in plusMemberships" :key="tier.name" class="membership-tier">
                <div><strong>{{ tier.name }}</strong><span>{{ tier.price }}</span></div><p>{{ tier.copy }}</p>
              </article>
            </div>
          </div>

          <div class="membership-example">
            <p class="detail-stage">Example monthly membership</p>
            <div class="membership-example-lines">
              <span><strong>Creator A · Gold</strong><b>£25</b></span>
              <span><strong>Creator B · Bronze</strong><b>£5</b></span>
              <span><strong>Bronze+ network access</strong><b>£3</b></span>
              <span class="membership-total"><strong>Total</strong><b>£33 / month</b></span>
            </div>
            <p>Plus access does not automatically distribute direct support to every creator viewed. Members remain in control of which creators they financially support and can change those choices monthly.</p>
          </div>
        </section>

        <section id="brands-commerce" class="investor-section investor-section-deep investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">Brands & commerce</p>
            <h2>Respawn is designed to grow the total creator economy around the network.</h2>
            <p>Brand Analytics, affiliate commerce and creator stores are intended to create additional creator income rather than simply taking another percentage from every creator opportunity.</p>
          </header>

          <div class="commercial-grid">
            <article class="commercial-card featured">
              <small>BRAND PARTNER ANALYTICS</small>
              <h3>Brands pay for better discovery.</h3>
              <p>Brands can pay a recurring platform fee for access to privacy protected creator and community analytics, then choose creators they want to work with.</p>
            </article>
            <article class="commercial-card">
              <small>AFFILIATE MARKETPLACE</small>
              <h3>10% of affiliate economics.</h3>
              <p>Members can choose the creator they want eligible affiliate activity to support. Respawn retains 10% of affiliate economic proceeds received.</p>
            </article>
            <article class="commercial-card">
              <small>CREATOR STORE</small>
              <h3>10% of creator net proceeds.</h3>
              <p>Respawn takes 10% of creator merchandise net proceeds after defined direct production, fulfilment and transaction costs.</p>
            </article>
          </div>
        </section>

        <section id="business-model" class="investor-section investor-anchor">
          <header class="section-heading">
            <p class="section-kicker">Business model</p>
            <h2>Multiple reinforcing revenue engines.</h2>
            <p>The early model is deliberately diversified across creator support, network access, brands, commerce and events rather than relying on a single subscription stream.</p>
          </header>

          <div class="revenue-engine-grid">
            <button
              v-for="engine in revenueEngines"
              :key="engine.key"
              type="button"
              :class="{ active: activeRevenueKey === engine.key }"
              @click="activeRevenueKey = engine.key"
            >
              <small>{{ engine.model }}</small>
              <strong>{{ engine.label }}</strong>
              <span>{{ engine.copy }}</span>
            </button>
          </div>
        </section>

        <section id="execution" class="investor-section investor-section-deep investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">18 month execution plan</p>
            <h2>The £300k round is intended to buy evidence, not just time.</h2>
            <p>Each phase should remove a specific category of investor risk: technology, creator adoption, data validity, commercial demand and repeatability.</p>
          </header>

          <div class="roadmap">
            <article v-for="item in executionRoadmap" :key="item.period" class="roadmap-item">
              <span>{{ item.period }}</span><div><h3>{{ item.title }}</h3><p>{{ item.copy }}</p></div>
            </article>
          </div>

          <div class="target-grid target-grid-full">
            <article v-for="target in executionTargets" :key="target.label">
              <strong>{{ target.value }}</strong><span>{{ target.label }}</span><small>{{ target.detail }}</small>
            </article>
          </div>
        </section>

        <section id="financials" class="investor-section investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">Financial outlook</p>
            <h2>Three scenarios. One operating discipline.</h2>
            <p>The 18 month model is driver based. The Execution Base Case is the operating plan. Harsh / Niche is the downside case and Global Breakout is upside rather than a hiring plan.</p>
          </header>

          <div class="scenario-tabs" role="tablist" aria-label="Financial scenarios">
            <button
              v-for="(scenario, key) in financialScenarios"
              :key="key"
              type="button"
              :class="{ active: activeScenarioKey === key }"
              @click="activeScenarioKey = key"
            >
              <span>{{ scenario.label }}</span><small>{{ scenario.tone }}</small>
            </button>
          </div>

          <div class="scenario-detail-card">
            <div class="scenario-intro">
              <div><p class="detail-stage">{{ activeScenario.tone }}</p><h3>{{ activeScenario.label }}</h3></div>
              <p>{{ activeScenario.description }}</p>
            </div>

            <div class="scenario-period-grid">
              <article>
                <small>SEPTEMBER 2027</small>
                <div class="scenario-metric"><span>Creators</span><strong>{{ activeScenario.sep2027.creators }}</strong></div>
                <div class="scenario-metric"><span>Active members</span><strong>{{ activeScenario.sep2027.members }}</strong></div>
                <div class="scenario-metric"><span>Paid conversion</span><strong>{{ activeScenario.sep2027.conversion }}</strong></div>
                <div class="scenario-metric highlight"><span>Monthly revenue</span><strong>{{ activeScenario.sep2027.monthlyRevenue }}</strong></div>
              </article>
              <article>
                <small>APRIL 2028</small>
                <div class="scenario-metric"><span>Creators</span><strong>{{ activeScenario.apr2028.creators }}</strong></div>
                <div class="scenario-metric"><span>Active members</span><strong>{{ activeScenario.apr2028.members }}</strong></div>
                <div class="scenario-metric highlight"><span>Monthly revenue</span><strong>{{ activeScenario.apr2028.monthlyRevenue }}</strong></div>
                <div class="scenario-metric"><span>Closing cash</span><strong>{{ activeScenario.apr2028.closingCash }}</strong></div>
              </article>
              <article class="scenario-summary-column">
                <small>18 MONTH OUTPUT</small>
                <strong>{{ activeScenario.cumulativeRevenue }}</strong>
                <span>Cumulative Respawn revenue</span>
                <p>Detailed assumptions and monthly cash flows are available in the investor financial model.</p>
              </article>
            </div>
          </div>

          <div class="long-term-model-card">
            <div>
              <p class="section-kicker">Next horizon</p>
              <h3>The 10 year model continues from these operating outcomes.</h3>
            </div>
            <p>The next section extends the same three scenarios through Year 10 using creator growth, member conversion, support depth, Plus adoption, brand economics, commerce, events and conditional direct streaming.</p>
          </div>
        </section>


        <section id="ten-year-growth" class="investor-section investor-section-deep investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">10 year growth opportunity</p>
            <h2>Built from the operating model, not backwards from an exit valuation.</h2>
            <p>Each scenario continues from Project Respawn's 18 month model. The purpose is to show what different levels of creator adoption, community growth and commercial execution could produce — not to present Year 10 as guaranteed.</p>
          </header>

          <div class="scenario-tabs long-term-tabs" role="tablist" aria-label="10 year growth scenarios">
            <button
              v-for="(scenario, key) in longTermScenarios"
              :key="`long-${key}`"
              type="button"
              :class="{ active: activeScenarioKey === key }"
              @click="activeScenarioKey = key"
            >
              <span>{{ scenario.label }}</span>
              <small>{{ scenario.tone }}</small>
            </button>
          </div>

          <div class="ten-year-overview-card">
            <div class="ten-year-copy">
              <p class="detail-stage">{{ activeLongTermScenario.tone }}</p>
              <h3>{{ activeLongTermScenario.label }}</h3>
              <p>{{ activeLongTermScenario.description }}</p>
            </div>

            <div class="ten-year-year10">
              <small>YEAR 10</small>
              <strong>{{ activeLongTermScenario.year10.revenue }}</strong>
              <span>Illustrative annual revenue</span>
            </div>
          </div>

          <div class="ten-year-chart" aria-label="Illustrative annual revenue progression">
            <article
              v-for="point in activeLongTermScenario.annualRevenue"
              :key="point.year"
              class="ten-year-bar-item"
            >
              <strong>{{ point.label }}</strong>
              <div class="ten-year-bar-track">
                <span
                  class="ten-year-bar-fill"
                  :style="{ height: `${Math.max(8, (Math.log10(point.value + 1) / Math.log10(longTermMaxRevenue + 1)) * 100)}%` }"
                ></span>
              </div>
              <small>{{ point.year }}</small>
            </article>
          </div>

          <p class="chart-note ten-year-chart-note">Bar height uses a logarithmic scale so the early and mature years remain readable together. The underlying values remain the labelled annual revenue figures.</p>

          <div class="year10-metric-grid">
            <article><small>ACTIVE CREATORS</small><strong>{{ activeLongTermScenario.year10.creators }}</strong></article>
            <article><small>ACTIVE MEMBERS</small><strong>{{ activeLongTermScenario.year10.activeMembers }}</strong></article>
            <article><small>PAYING MEMBERS</small><strong>{{ activeLongTermScenario.year10.payingMembers }}</strong></article>
            <article><small>PAID CREATOR RELATIONSHIPS</small><strong>{{ activeLongTermScenario.year10.paidRelationships }}</strong></article>
            <article><small>PAID CONVERSION</small><strong>{{ activeLongTermScenario.year10.paidConversion }}</strong></article>
            <article><small>EBITDA</small><strong>{{ activeLongTermScenario.year10.ebitda }}</strong><span>{{ activeLongTermScenario.year10.ebitdaMargin }} margin</span></article>
          </div>

          <div class="ten-year-milestone-table" role="table" aria-label="10 year growth milestones">
            <div class="ten-year-milestone-row ten-year-milestone-head" role="row">
              <span>Milestone</span><span>Creators</span><span>Active members</span><span>Annual revenue</span>
            </div>
            <div v-for="milestone in activeLongTermScenario.milestones" :key="milestone.year" class="ten-year-milestone-row" role="row">
              <strong>{{ milestone.year }}</strong><span>{{ milestone.creators }}</span><span>{{ milestone.members }}</span><span>{{ milestone.revenue }}</span>
            </div>
          </div>

          <div class="growth-stage-block">
            <header class="growth-stage-heading">
              <p class="section-kicker">What creates the next stage of growth?</p>
              <h3>The business evolves as the network earns the right to expand.</h3>
            </header>
            <div class="growth-stage-grid">
              <article v-for="stage in growthStages" :key="stage.stage">
                <span>{{ stage.stage }}</span>
                <h4>{{ stage.title }}</h4>
                <p>{{ stage.copy }}</p>
              </article>
            </div>
          </div>

          <div class="strategy-callout score-warning">
            <strong>Global Breakout is an upside scenario, not the operating budget.</strong>
            <p>Fixed costs should scale only when actual retention, creator earnings uplift, paid conversion, brand demand and infrastructure economics demonstrate that the next stage is justified.</p>
          </div>
        </section>

        <section id="moat" class="investor-section investor-section-deep investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">Competition & moat</p>
            <h2>Strong incumbents own the parts. Respawn is targeting the intersection.</h2>
            <p>Twitch, Discord, Patreon, creator tool providers and analytics companies are strong in individual categories. The strategic opportunity is connecting those workflows to an owned community and commercial evidence layer.</p>
          </header>

          <div class="moat-grid">
            <article v-for="point in moatPoints" :key="point.title">
              <h3>{{ point.title }}</h3><p>{{ point.copy }}</p>
            </article>
          </div>

          <div class="strategy-callout">
            <strong>The moat is not a single feature.</strong>
            <p>It is the combination of creator workflow, community relationships, cross creator network effects, first party participation evidence and commercial history that becomes harder to reproduce as the network grows.</p>
          </div>
        </section>

        <section id="roadmap" class="investor-section investor-anchor">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">Roadmap & long term vision</p>
            <h2>Earn each expansion.</h2>
            <p>Project Respawn launches as an integration and community layer. Direct streaming, research and physical infrastructure only become priorities when the evidence and economics justify them.</p>
          </header>

          <div class="streaming-roadmap">
            <article v-for="(item, index) in streamingMilestones" :key="item.title">
              <span>{{ String(index + 1).padStart(2, '0') }}</span><div><h3>{{ item.title }}</h3><p>{{ item.copy }}</p></div>
            </article>
          </div>

          <div class="vision-grid">
            <article>
              <small>CREATOR CONTINUITY</small>
              <h3>A creator taking leave should not mean the community disappears.</h3>
              <p>Future planned leave can show a return date, recommend compatible creators and events while someone is away, then notify the community when they return.</p>
            </article>
            <article>
              <small>MISSION AT SCALE</small>
              <h3>Human connection remains the objective.</h3>
              <p>Independent social confidence research is a later stage ambition once the commercial company can responsibly fund it and the evidence supports doing so.</p>
            </article>
            <article>
              <small>ULTIMATE AMBITION</small>
              <h3>A physical home for the ecosystem.</h3>
              <p>The long term London arena and mixed use Respawn destination remains ambition only. It is not included in this round and should only be pursued from substantial future scale.</p>
            </article>
          </div>
        </section>

        <section id="raise" class="investor-section investor-section-deep investor-anchor raise-section">
          <header class="section-heading section-heading-wide">
            <p class="section-kicker">The raise</p>
            <h2>Raising £300,000 Pre Seed.</h2>
            <p>Targeting an initial £250,000 close and approximately 18 months of planned runway. Final investment structure, valuation and tax relief eligibility remain subject to appropriate legal and professional advice.</p>
          </header>

          <div class="raise-grid">
            <div class="raise-summary-card">
              <small>CURRENT FUNDRAISE</small>
              <strong>£300,000</strong>
              <span>Target round</span>
              <div class="raise-mini-grid"><span><b>£250k</b> target initial close</span><span><b>18 months</b> planned runway</span><span><b>Nov 2026</b> launch target</span></div>
            </div>

            <div class="funds-card">
              <div v-for="item in useOfFunds" :key="item.label" class="fund-row">
                <div><strong>{{ item.label }}</strong><span>{{ formatCurrency(item.value) }}</span></div>
                <span class="fund-bar"><i :style="{ width: `${(item.value / 100000) * 100}%` }"></i></span>
              </div>
            </div>
          </div>

          <div class="proof-section">
            <div class="proof-heading"><p class="section-kicker">What this round is intended to prove</p><h3>Convert the vision into evidence.</h3></div>
            <ol class="proof-list">
              <li v-for="(point, index) in proofPoints" :key="point"><span>{{ String(index + 1).padStart(2, '0') }}</span><p>{{ point }}</p></li>
            </ol>
          </div>

          <div class="investor-info-block">
            <div class="investor-info-heading">
              <div><p class="section-kicker">Investor information</p><h3>Want to go deeper?</h3></div>
              <p>Select the areas you would like to receive more detail on.</p>
            </div>

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
              <div><strong>{{ investorInfoSelections.length || 'No' }} area{{ investorInfoSelections.length === 1 ? '' : 's' }} selected</strong><p>Detailed diligence information can be shared at the appropriate stage and, where necessary, under NDA.</p></div>
              <button type="button" class="investor-primary-button" @click="requestInvestorInfo">Request investor information</button>
            </div>
            <form v-if="requestFormOpen" class="investor-request-form" @submit.prevent="submitInvestorRequest">
              <h3>Request investor access</h3><p>Requests are reviewed before any account-linked Data Room access is granted.</p>
              <label>Name<input v-model.trim="requestForm.name" required maxlength="120"></label>
              <label>Work email<input v-model.trim="requestForm.email" type="email" required maxlength="254"></label>
              <label>Organisation / fund<input v-model.trim="requestForm.organisation" maxlength="160"></label>
              <label>Role / title<input v-model.trim="requestForm.role" maxlength="120"></label>
              <label>Investment interest or context<textarea v-model.trim="requestForm.investmentContext" required maxlength="1000"></textarea></label>
              <label>Additional message<textarea v-model.trim="requestForm.message" maxlength="3000"></textarea></label>
              <label class="request-website" aria-hidden="true">Website<input v-model="requestForm.website" tabindex="-1" autocomplete="off"></label>
              <p v-if="requestStatus" role="status">{{ requestStatus }}</p>
              <button class="investor-primary-button" type="submit" :disabled="requestSubmitting">{{ requestSubmitting ? 'Submitting…' : 'Submit access request' }}</button>
            </form>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script>
import { generateClient } from 'aws-amplify/data';
import {
  investorNavigation,
  headlineStats,
  thesisPoints,
  problems,
  productLayers,
  creatorTools,
  creatorScorePrinciples,
  growthFlywheel,
  executionTargets,
  creatorPathway,
  directMemberships,
  plusMemberships,
  revenueEngines,
  financialScenarios,
  longTermScenarios,
  growthStages,
  executionRoadmap,
  streamingMilestones,
  moatPoints,
  useOfFunds,
  proofPoints,
  investorInfoOptions
} from './investorData.js';

export default {
  name: 'Investors',
  data() {
    return {
      investorNavigation,
      headlineStats,
      thesisPoints,
      problems,
      productLayers,
      creatorTools,
      creatorScorePrinciples,
      growthFlywheel,
      executionTargets,
      creatorPathway,
      directMemberships,
      plusMemberships,
      revenueEngines,
      financialScenarios,
      longTermScenarios,
      growthStages,
      executionRoadmap,
      streamingMilestones,
      moatPoints,
      useOfFunds,
      proofPoints,
      investorInfoOptions,
      activeSection: 'overview',
      activeProductKey: 'creator-tools',
      activeRevenueKey: 'creator-support',
      activeScenarioKey: 'base',
      investorInfoSelections: [],
      mobileIndexOpen: false,
      sectionObserver: null
      ,requestFormOpen: false, requestSubmitting: false, requestStatus: '',
      requestForm: { name: '', email: '', organisation: '', role: '', investmentContext: '', message: '', website: '' }
    };
  },
  computed: {
    activeIndex() {
      const index = this.investorNavigation.findIndex((item) => item.id === this.activeSection);
      return index >= 0 ? index : 0;
    },
    activeProduct() {
      return this.productLayers.find((item) => item.key === this.activeProductKey) || this.productLayers[0];
    },
    activeScenario() {
      return this.financialScenarios[this.activeScenarioKey];
    },
    activeLongTermScenario() {
      return this.longTermScenarios[this.activeScenarioKey];
    },
    longTermMaxRevenue() {
      const values = Object.values(this.longTermScenarios).flatMap((scenario) =>
        scenario.annualRevenue.map((point) => point.value)
      );
      return Math.max(...values, 1);
    }
  },
  mounted() {
    this.initSectionObserver();
  },
  beforeUnmount() {
    if (this.sectionObserver) this.sectionObserver.disconnect();
  },
  methods: {
    initSectionObserver() {
      const sections = this.investorNavigation
        .map((item) => document.getElementById(item.id))
        .filter(Boolean);

      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (visible.length) this.activeSection = visible[0].target.id;
        },
        {
          rootMargin: '-18% 0px -62% 0px',
          threshold: [0.05, 0.15, 0.3, 0.5]
        }
      );

      sections.forEach((section) => this.sectionObserver.observe(section));
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0
      }).format(value);
    },
    toggleInvestorInfo(key) {
      const index = this.investorInfoSelections.indexOf(key);
      if (index >= 0) this.investorInfoSelections.splice(index, 1);
      else this.investorInfoSelections.push(key);
    },
    requestInvestorInfo() {
      const selected = this.investorInfoOptions.filter((item) => this.investorInfoSelections.includes(item.key));
      this.requestForm.investmentContext = selected.length ? selected.map((item) => item.title).join(', ') : 'General investor information';
      this.requestFormOpen = true; this.requestStatus = '';
      this.$nextTick(() => document.querySelector('.investor-request-form input')?.focus());
    },
    async submitInvestorRequest() {
      this.requestSubmitting = true; this.requestStatus = '';
      try {
        const token = globalThis.crypto?.randomUUID?.().replaceAll('-', '') || `${Date.now()}${Math.random()}`.replace(/\D/g, '').padEnd(20, '0');
        const { website, ...payload } = this.requestForm;
        const result = await generateClient().mutations.submitInvestorAccessRequest({ payload, requestToken: token, website });
        if (result.errors?.length || !result.data?.success) throw new Error(result.errors?.[0]?.message || result.data?.message || 'Request failed');
        this.requestStatus = result.data.alreadySubmitted ? 'This request was already received.' : 'Your investor access request has been received for review.';
      } catch (error) { this.requestStatus = error.message || 'The request could not be submitted.'; }
      finally { this.requestSubmitting = false; }
    }
  }
};
</script>

<style scoped src="./Investors.css"></style>
