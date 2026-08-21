<template>
  <div>
    <div class="legal-overview-grid">
      <article class="legal-card">
        <strong>👤 What we collect</strong>
        <p>Account, profile, community, creator, application, payment and service activity data where relevant.</p>
      </article>
      <article class="legal-card">
        <strong>🎯 Why we use it</strong>
        <p>To provide Project Respawn, personalise experiences, keep services safe and improve what we build.</p>
      </article>
      <article class="legal-card">
        <strong>🛡️ Who may process it</strong>
        <p>Project Respawn and trusted providers that help us host, authenticate, communicate and take payments.</p>
      </article>
      <article class="legal-card">
        <strong>✅ Your controls</strong>
        <p>You can manage settings, disconnect supported integrations and exercise your data protection rights.</p>
      </article>
    </div>

    <div class="legal-callout">
      <h2>Your community is not our product</h2>
      <p>
        Project Respawn is designed to use data to operate and improve our services,
        personalise experiences and provide useful creator and community insights.
        We do not sell identifiable community member data to advertisers or brands.
      </p>
    </div>

    <p><strong>Which part of Project Respawn are you using?</strong></p>
    <div class="legal-chips" aria-label="Privacy topic selector">
      <button
        v-for="section in summaries"
        :key="section.id"
        type="button"
        class="legal-chip"
        :class="{ active: activeSummary === section.id }"
        @click="activeSummary = section.id"
      >
        {{ section.label }}
      </button>
    </div>

    <div class="legal-summary" aria-live="polite">
      <h2>{{ currentSummary.title }}</h2>
      <p>{{ currentSummary.text }}</p>
      <ul v-if="currentSummary.points?.length">
        <li v-for="point in currentSummary.points" :key="point">{{ point }}</li>
      </ul>
    </div>

    <div class="legal-layout">
      <nav class="legal-toc" aria-label="Privacy policy contents">
        <strong>On this page</strong>
        <a v-for="item in toc" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
      </nav>

      <article class="legal-document">
        <h2>Project Respawn Privacy Policy</h2>
        <p class="legal-muted"><em>Last updated: 19 August 2026</em></p>

        <h3 id="privacy-1">1. Who we are</h3>
        <p>
          Project Respawn is a social confidence, gaming and creator platform. Our services may include
          our website, beta applications, community features, creator tools, creator programmes,
          applications and bookings, rewards, memberships, analytics and other services that link to this policy.
        </p>
        <p>
          <strong>Data controller:</strong> Nicholas Grefsheim / Ravens Community Gaming Ltd<br>
          <strong>Service/brand:</strong> Project Respawn<br>
          <strong>Email:</strong> Help@Projectrespawn.com<br>
          <strong>Address:</strong> Ravens Community Gaming, 61 Bridge Street, Kington, HR5 3DJ, United Kingdom
        </p>
        <p>
          We are based in the United Kingdom. The Information Commissioner's Office (ICO) is the
          UK's independent data protection regulator.
        </p>

        <h3 id="privacy-2">2. Scope of this policy</h3>
        <p>
          This policy applies to Project Respawn services that link to it, including the Project Respawn
          website, beta app, account and profile services, creator tools, creator programme, community
          features, applications, induction and booking systems, purchases and other connected services.
        </p>
        <p>
          Some features may have additional notices where more specific information is helpful. If an
          additional notice conflicts with this policy for a particular feature, the more specific notice
          will explain which terms apply.
        </p>

        <h3 id="privacy-3">3. Information we collect and why</h3>

        <h4>3.1 Account, authentication and profile information</h4>
        <p>
          We may process your email address, username, account identifiers, authentication information,
          profile information, avatar, biography, preferences, privacy settings and notification choices.
          We use this information to create and manage accounts, authenticate users, display profiles,
          remember choices and keep accounts secure.
        </p>
        <p>
          <strong>Lawful bases:</strong> contract where this is necessary to provide the service you request;
          and legitimate interests where necessary to protect our services, users and accounts.
        </p>

        <h4>3.2 Confidence, quests, progression and companion data</h4>
        <p>
          Where these features are available, we may process confidence or progression scores, quests
          assigned or completed, streaks, achievements, progress history and interactions with virtual
          companions or pets. We use this to provide progression, recommendations, rewards and the
          confidence-building experience.
        </p>
        <p>
          We treat information relating to confidence, wellbeing or vulnerability with particular care.
          Where information amounts to special category data under UK data protection law, we will only
          process it where an appropriate lawful basis and additional condition applies.
        </p>

        <h4>3.3 Social, forum and community information</h4>
        <p>
          We may process friends, follows, community memberships, invitations, posts, comments, reactions,
          reports, moderation records and participation in social or community features. We use this to
          provide community functionality, enforce community rules, investigate abuse and keep users safe.
        </p>

        <h4>3.4 Games, interests, availability and preferences</h4>
        <p>
          You may choose to provide favourite games, genres, gaming roles, ranks, interests, time zone,
          availability and similar preference information. We use this to personalise Project Respawn,
          improve recommendations and support relevant programme or community features.
        </p>

        <h4>3.5 Creator programme and application information</h4>
        <p>
          If you apply to a Project Respawn programme, we may process application answers, creator or
          gaming profiles, links you provide, availability, experience, reviewer scores and comments,
          application status, audit records, induction information and booking details.
        </p>
        <p>
          We use this information to administer applications, assess suitability, prevent duplicate or
          fraudulent applications, arrange meetings or inductions and maintain an appropriate audit trail.
          Where human reviewers assess applications, Project Respawn may use structured scoring to support
          that process, but material application decisions are intended to involve human oversight.
        </p>

        <h4>3.6 Creator Tools and connected services</h4>
        <p>
          If you choose to connect a supported third-party service such as Twitch or Discord, we may
          process information made available through the permissions you grant. Depending on the
          integration, this may include account or channel identifiers, server information, permitted
          community activity, engagement information, moderation events, commands, alerts and analytics.
        </p>
        <p>
          Connecting third-party services is optional. Where Project Respawn provides controls to restrict
          particular sources, channels or categories of information, we will respect those choices.
          Disconnecting an integration stops future collection through that connection, subject to limited
          information we may need to retain for security, legal compliance, disputes or existing transactions.
        </p>

        <h4>3.7 Creator Score, Community Score and analytics</h4>
        <p>
          Project Respawn may analyse activity within our services and authorised connected services to
          generate analytics, recommendations and indicators such as Creator Score or Community Score.
          These may consider categories such as engagement, consistency, community participation and
          activity relevant to the feature being provided.
        </p>
        <p>
          We may use these insights to personalise creator tools, help creators understand community
          development, improve recommendations, support programme decisions and produce aggregated or
          anonymised business insight. We do not publish private connected-service information by default.
        </p>

        <h4>3.8 Rewards, memberships and purchases</h4>
        <p>
          We may process membership status, in-app balances, rewards, redemption history, purchase details,
          amount, currency, transaction time, billing details and limited payment metadata. Full payment
          card credentials are handled by the relevant payment provider rather than stored by Project Respawn.
        </p>
        <p>
          We use transaction information to provide purchases and memberships, manage rewards, issue refunds,
          maintain accounting records and detect fraud or abuse.
        </p>

        <h4>3.9 Communications</h4>
        <p>
          We may process contact details and communication records to send essential account, security,
          application, booking and service messages. Optional marketing, beta or waitlist communications
          will be sent where we have the appropriate permission or other lawful basis.
        </p>

        <h4>3.10 Technical, device and security data</h4>
        <p>
          We may process IP addresses, device/browser information, session information, diagnostic logs,
          failed authentication events, security events and technical error information. We use this to
          operate, troubleshoot and protect Project Respawn.
        </p>

        <h4>3.11 Surveys, research and future features</h4>
        <p>
          We may invite users to participate in optional surveys or research. Where a survey or research
          project involves additional or sensitive uses of personal data, we will provide appropriate
          information before participation. New features that materially change how we use personal data
          will be reflected in this policy or an additional privacy notice before or when they launch.
        </p>

        <h3 id="privacy-4">4. Lawful bases</h3>
        <p>Depending on the activity, Project Respawn may rely on:</p>
        <ul>
          <li><strong>Contract</strong> where processing is necessary to provide a service you request.</li>
          <li><strong>Legitimate interests</strong> for purposes such as security, fraud prevention, service improvement and appropriate business administration, where those interests are not overridden by your rights.</li>
          <li><strong>Consent</strong> where you have a genuine choice and can withdraw that consent.</li>
          <li><strong>Legal obligation</strong> where processing is required by law, for example certain financial or regulatory records.</li>
        </ul>
        <p>
          Where we process special category data, we will also identify and rely on an additional condition
          permitted by UK data protection law.
        </p>

        <h3 id="privacy-5">5. Who we share information with</h3>
        <p>
          We do not sell identifiable personal information to advertisers or brands. We may share or make
          personal data available to trusted service providers where necessary to operate Project Respawn.
          These may include:
        </p>
        <ul>
          <li><strong>Replit</strong> for hosting and infrastructure used by parts of the Project Respawn beta application.</li>
          <li><strong>Amazon Web Services (AWS)</strong> for cloud infrastructure used by parts of Project Respawn, including authentication, APIs, databases, storage and serverless processing. Services may include Amazon Cognito for account authentication and identity management.</li>
          <li><strong>Microsoft</strong> for business email, communications and, where enabled, calendar or booking functionality.</li>
          <li><strong>Revolut</strong> for payment processing where Project Respawn payments use Revolut services.</li>
          <li><strong>Connected platforms</strong> such as Twitch or Discord where you choose to connect an account and information must be exchanged to provide the requested integration.</li>
          <li><strong>Professional advisers, regulators, law enforcement or other parties</strong> where disclosure is necessary to comply with law, protect rights or manage a legal claim.</li>
        </ul>
        <p>
          Our providers may change as Project Respawn develops. We will update this policy where a change
          materially affects how your personal data is processed.
        </p>

        <h3 id="privacy-6">6. Brands, sponsors and aggregated insight</h3>
        <p>
          Project Respawn may develop reports or insights for creators, partners, sponsors or brands.
          Our intended default is to use aggregated or anonymised information for external market and
          community insights so that individual community members are not identified.
        </p>
        <p>
          If we propose an activity that would disclose identifiable personal information to a brand or
          partner for a separate purpose, we will identify an appropriate lawful basis and provide any
          additional transparency or choice required by law.
        </p>

        <h3 id="privacy-7">7. International transfers</h3>
        <p>
          Project Respawn is based in the UK, but some technology and service providers operate internationally.
          This means personal data may be processed or accessed outside the UK.
        </p>
        <p>
          Where UK data protection law treats a transfer as restricted, we use an appropriate transfer mechanism
          where required, such as UK adequacy regulations, the UK International Data Transfer Agreement,
          the UK Addendum to approved Standard Contractual Clauses, or another legally recognised safeguard.
        </p>

        <h3 id="privacy-8">8. How long we keep information</h3>
        <p>
          We keep personal data only for as long as reasonably necessary for the purpose for which it was
          collected, including legal, accounting, security and dispute-resolution requirements.
        </p>
        <ul>
          <li>Account/profile information: generally while your account remains active, subject to deletion and legal retention requirements.</li>
          <li>Confidence, quest, progression and community data: generally while needed to provide the relevant account experience, then deleted or anonymised where appropriate following account deletion.</li>
          <li>Application and review information: retained for a reasonable period needed to administer the programme, handle queries and maintain appropriate recruitment/audit records.</li>
          <li>Payment and accounting records: retained for the period required for accounting, tax, fraud prevention and legal obligations.</li>
          <li>Security logs and tokens: retained for limited periods appropriate to their security purpose, with temporary tokens expiring automatically where designed to do so.</li>
          <li>Optional mailing lists: retained until you unsubscribe, withdraw consent or the list is no longer required.</li>
        </ul>
        <p>
          We will continue to refine documented retention periods as Project Respawn services mature.
        </p>

        <h3 id="privacy-9">9. Your choices and privacy controls</h3>
        <p>Depending on the feature, you may be able to:</p>
        <ul>
          <li>change profile visibility and notification preferences;</li>
          <li>choose whether to connect optional third-party services;</li>
          <li>disconnect supported Twitch, Discord or other integrations;</li>
          <li>restrict supported sources or channels from creator-tool processing;</li>
          <li>download or request a copy of personal data;</li>
          <li>delete your account or ask us to delete eligible personal data; and</li>
          <li>withdraw consent where processing is based on consent.</li>
        </ul>

        <h3 id="privacy-10">10. Your data protection rights</h3>
        <p>
          Depending on the circumstances, UK data protection law may give you rights to access, correct,
          erase or restrict personal data; object to certain processing; receive certain data in a portable
          format; and withdraw consent where consent is the lawful basis.
        </p>
        <p>
          Rights are not absolute and may depend on the processing involved. To exercise a right, use any
          available in-product controls or contact Help@Projectrespawn.com.
        </p>

        <h3 id="privacy-11">11. Cookies and similar technologies</h3>
        <p>
          Project Respawn may use cookies, local storage or similar technologies that are necessary to keep
          users signed in, remember essential settings, provide security and operate the service.
        </p>
        <p>
          If we use non-essential analytics, advertising or tracking technologies that require consent,
          we will provide the appropriate choice and update our cookie information.
        </p>

        <h3 id="privacy-12">12. Personalisation, profiling and automated processing</h3>
        <p>
          Project Respawn may use automated processing to personalise experiences, calculate progression,
          generate recommendations and create analytics such as creator or community indicators.
        </p>
        <p>
          These systems are intended to support the Project Respawn experience. Where we make a decision
          that is solely automated and produces legal or similarly significant effects, we will provide
          the safeguards and information required by law. Material creator application decisions are
          intended to retain meaningful human involvement.
        </p>

        <h3 id="privacy-13">13. Children and younger users</h3>
        <p>
          Project Respawn is currently intended for users aged 13 and over. Because our services may be
          accessed by people under 18, we aim to design privacy information and relevant controls with
          younger users in mind.
        </p>
        <p>
          We seek to minimise unnecessary collection, use privacy-protective defaults where appropriate,
          explain important uses of information clearly and take particular care with profiling, location,
          wellbeing-related information and sharing involving younger users.
        </p>
        <div class="legal-note">
          Some Project Respawn programmes or commercial/creator features may have a higher minimum age
          or require additional eligibility checks. Those requirements will be explained for the relevant feature.
        </div>

        <h3 id="privacy-14">14. Security</h3>
        <p>
          We use technical and organisational measures designed to protect personal information against
          accidental loss, misuse, unauthorised access, disclosure, alteration or destruction. Measures
          may include authentication controls, encryption where appropriate, access controls, secure
          session handling, logging, data minimisation, backups and vulnerability/security monitoring.
        </p>
        <p>
          No online service can guarantee absolute security. Please protect your login credentials and
          tell us promptly if you believe your account or personal information has been compromised.
        </p>

        <h3 id="privacy-15">15. Changes to this policy</h3>
        <p>
          Project Respawn will evolve. We may update this policy when services, legal requirements,
          providers or data uses change. We will update the date at the top and provide additional notice
          where a change is significant and that notice is required or appropriate.
        </p>

        <h3 id="privacy-16">16. Contact and complaints</h3>
        <p>
          For privacy questions or to exercise your rights, contact:
        </p>
        <p>
          <strong>Nicholas Grefsheim / Ravens Community Gaming Ltd</strong><br>
          <strong>Project Respawn</strong><br>
          <strong>Email:</strong> Help@Projectrespawn.com<br>
          <strong>Address:</strong> Ravens Community Gaming, 61 Bridge Street, Kington, HR5 3DJ, United Kingdom
        </p>
        <p>
          You also have the right to raise a concern with the Information Commissioner's Office if you
          are unhappy with how your personal data has been handled.
        </p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const activeSummary = ref('app')

const summaries = [
  {
    id: 'app',
    label: 'Respawn App',
    title: 'Project Respawn App',
    text: 'The app may use account, profile, quest, progression, preference, community and reward information to provide and personalise your experience.',
    points: [
      'Account and authentication data keep your account working and secure.',
      'Quest and progression information supports recommendations, achievements and rewards.',
      'Privacy controls determine what other users can see where those controls are available.'
    ]
  },
  {
    id: 'creator',
    label: 'Creator Tools',
    title: 'Creator Tools',
    text: 'Creators can choose to connect supported services such as Twitch or Discord. Project Respawn processes information permitted through those connections to provide creator tools, moderation, analytics and community features.',
    points: [
      'Connections are optional.',
      'Supported integrations can be disconnected.',
      'We do not sell identifiable community member data to advertisers or brands.'
    ]
  },
  {
    id: 'applications',
    label: 'Applications',
    title: 'Applications & Programmes',
    text: 'If you apply to join a Project Respawn programme, we may process your answers, profiles, availability and reviewer information to assess and administer your application.',
    points: [
      'Reviewers may score and comment on applications.',
      'Material application decisions are intended to retain human oversight.',
      'Accepted applicants may provide additional induction and booking information.'
    ]
  },
  {
    id: 'community',
    label: 'Community',
    title: 'Community & Social Features',
    text: 'Community features may process friendships, follows, posts, reactions, participation and moderation information so people can interact and so Project Respawn can keep services safe.',
    points: []
  },
  {
    id: 'payments',
    label: 'Payments',
    title: 'Payments, Memberships & Rewards',
    text: 'We keep transaction and entitlement information needed to provide purchases, memberships and rewards. Full card credentials are handled by the relevant payment provider rather than stored by Project Respawn.',
    points: []
  },
  {
    id: 'analytics',
    label: 'Scores & Analytics',
    title: 'Creator Score, Community Score & Analytics',
    text: 'Project Respawn may analyse relevant activity to produce recommendations, progression and creator/community insights. External brand insight is intended to use aggregated or anonymised information by default.',
    points: []
  }
]

const currentSummary = computed(
  () => summaries.find(section => section.id === activeSummary.value) ?? summaries[0]
)

const toc = [
  { id: 'privacy-1', label: '1. Who we are' },
  { id: 'privacy-2', label: '2. Scope' },
  { id: 'privacy-3', label: '3. Information we collect' },
  { id: 'privacy-4', label: '4. Lawful bases' },
  { id: 'privacy-5', label: '5. Sharing' },
  { id: 'privacy-6', label: '6. Brands & insight' },
  { id: 'privacy-7', label: '7. International transfers' },
  { id: 'privacy-8', label: '8. Retention' },
  { id: 'privacy-9', label: '9. Your controls' },
  { id: 'privacy-10', label: '10. Your rights' },
  { id: 'privacy-11', label: '11. Cookies' },
  { id: 'privacy-12', label: '12. Profiling' },
  { id: 'privacy-13', label: '13. Younger users' },
  { id: 'privacy-14', label: '14. Security' },
  { id: 'privacy-15', label: '15. Changes' },
  { id: 'privacy-16', label: '16. Contact' }
]
</script>
