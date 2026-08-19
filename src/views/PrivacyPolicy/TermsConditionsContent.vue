<template>
  <div>
    <div class="legal-overview-grid">
      <article class="legal-card">
        <strong>🎮 Use Respawn fairly</strong>
        <p>Use Project Respawn lawfully, respectfully and without trying to damage, exploit or disrupt the service.</p>
      </article>
      <article class="legal-card">
        <strong>👤 Your account</strong>
        <p>Keep your account details accurate and protect your login credentials. You are responsible for activity on your account.</p>
      </article>
      <article class="legal-card">
        <strong>🧩 Connected services</strong>
        <p>Creator integrations rely on third-party platforms and their rules. Project Respawn cannot guarantee third-party availability.</p>
      </article>
      <article class="legal-card">
        <strong>🧪 Beta means beta</strong>
        <p>Testing features may change, break or be withdrawn while we learn what works and improve the platform.</p>
      </article>
    </div>

    <p><strong>What do you want to understand?</strong></p>
    <div class="legal-chips" aria-label="Terms topic selector">
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
      <nav class="legal-toc" aria-label="Terms and conditions contents">
        <strong>On this page</strong>
        <a v-for="item in toc" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
      </nav>

      <article class="legal-document">
        <h2>Project Respawn Terms & Conditions</h2>
        <p class="legal-muted"><em>Last updated: 19 August 2026</em></p>

        <h3 id="terms-1">1. About these terms</h3>
        <p>
          These Terms & Conditions govern your access to and use of Project Respawn services that link
          to these terms. This may include our website, beta application, accounts and profiles, community
          features, creator tools, creator programmes, applications and bookings, memberships, rewards,
          purchases and other Project Respawn services.
        </p>
        <p>
          Project Respawn is currently operated by Nicholas Grefsheim / Ravens Community Gaming Ltd.
          References to “Project Respawn”, “we”, “us” and “our” in these terms refer to the operator of
          the relevant Project Respawn service.
        </p>
        <p>
          By creating an account or using a Project Respawn service, you agree to these terms where they
          apply to you. If you do not agree, do not use the relevant service.
        </p>

        <h3 id="terms-2">2. Eligibility and age</h3>
        <p>
          The general Project Respawn service is currently intended for people aged 13 or over.
          Some creator, commercial, competitive, payment or programme features may require a higher
          minimum age or additional eligibility requirements.
        </p>
        <p>
          You must provide accurate age or eligibility information where we ask for it and must not
          deliberately bypass age, access or programme restrictions.
        </p>
        <p>
          If you are under 18, some contracts, purchases, creator arrangements or other features may
          require involvement or permission from a parent or guardian where applicable.
        </p>

        <h3 id="terms-3">3. Accounts</h3>
        <p>
          You are responsible for maintaining the confidentiality and security of your login credentials
          and for activity carried out through your account, except where responsibility cannot legally
          be placed on you.
        </p>
        <ul>
          <li>Provide accurate information and keep important account information up to date.</li>
          <li>Do not share, sell or transfer an account in a way we have not authorised.</li>
          <li>Tell us promptly if you believe your account has been compromised.</li>
          <li>Do not create accounts to evade a suspension, restriction or ban.</li>
        </ul>

        <h3 id="terms-4">4. Community standards and acceptable use</h3>
        <p>You must not use Project Respawn to:</p>
        <ul>
          <li>break the law or encourage unlawful activity;</li>
          <li>harass, threaten, bully, exploit or deliberately endanger another person;</li>
          <li>post or distribute content you do not have the right to use;</li>
          <li>impersonate another person or materially misrepresent your identity;</li>
          <li>send spam, scams, malware or deceptive content;</li>
          <li>attempt unauthorised access to accounts, systems, APIs or data;</li>
          <li>interfere with, overload, scrape or reverse engineer Project Respawn except where the law expressly permits it;</li>
          <li>manipulate rewards, scores, applications, engagement or other platform systems dishonestly; or</li>
          <li>use Project Respawn in a way that creates an unreasonable risk to other users, our services or third parties.</li>
        </ul>
        <p>
          Additional community, competition, programme or creator rules may apply to specific activities.
        </p>

        <h3 id="terms-5">5. User content</h3>
        <p>
          You retain ownership of content you create and submit to Project Respawn, subject to any rights
          belonging to others.
        </p>
        <p>
          When you submit content that must be displayed, stored, moderated or distributed to provide a
          Project Respawn feature, you give us a non-exclusive licence to host, reproduce, format, display
          and otherwise process that content only as reasonably necessary to operate, secure, improve and
          provide that feature and as otherwise described to you.
        </p>
        <p>
          You are responsible for ensuring you have the rights and permissions needed for content you upload
          or connect to Project Respawn.
        </p>

        <h3 id="terms-6">6. Creator Tools and third-party integrations</h3>
        <p>
          Creator Tools may allow you to connect third-party services such as Twitch, Discord or other
          supported platforms. These services are provided by third parties and remain subject to their
          own terms, developer policies, availability and technical restrictions.
        </p>
        <ul>
          <li>You must only connect accounts, channels, servers or communities you are authorised to manage.</li>
          <li>You must use Project Respawn integrations consistently with the rules of the connected platform.</li>
          <li>You are responsible for configuring moderation, commands, alerts, overlays and other creator settings appropriately.</li>
          <li>We may change or suspend an integration if required by a third-party platform, security issue, law or technical change.</li>
        </ul>
        <p>
          We do not guarantee that any third-party service will remain available, compatible or unchanged.
        </p>

        <h3 id="terms-7">7. Creator programmes, applications and selection</h3>
        <p>
          Applying to a Project Respawn creator, competitive or other programme does not guarantee acceptance,
          employment, sponsorship, payment, representation or any other commercial relationship.
        </p>
        <p>
          We may assess applications against programme criteria, reviewer feedback, capacity, safety,
          community fit and other relevant considerations. Unless specific programme terms state otherwise,
          we may pause, close or change application pathways as Project Respawn develops.
        </p>
        <p>
          If you are accepted into a programme that includes payment, revenue share, sponsorship, employment,
          contractor arrangements or other material commercial terms, those arrangements should be governed
          by separate written terms or an agreement.
        </p>

        <h3 id="terms-8">8. Creator Scores, recommendations and analytics</h3>
        <p>
          Project Respawn may provide scores, rankings, recommendations, analytics or forecasts based on
          platform and authorised connected-service data. These outputs are tools and indicators, not guarantees.
        </p>
        <p>
          A Creator Score, Community Score, recommendation, estimate or other metric does not guarantee
          sponsorship, earnings, audience growth, programme acceptance or commercial success.
        </p>
        <p>
          You must not deliberately manipulate, automate, falsify or purchase activity for the purpose of
          misleading Project Respawn metrics or other users.
        </p>

        <h3 id="terms-9">9. Purchases, memberships and payments</h3>
        <p>
          Where Project Respawn offers paid products, memberships or services, the price and key purchase
          information shown at checkout form part of your purchase.
        </p>
        <p>
          Payments may be processed by a third-party payment provider. You must provide accurate payment
          and billing information and must be authorised to use the selected payment method.
        </p>
        <p>
          Refund, cancellation, renewal and withdrawal rights depend on the product, how it is supplied
          and applicable consumer law. Nothing in these terms removes rights that UK consumer law says
          cannot be excluded.
        </p>
        <p>
          If recurring memberships are introduced, the applicable price, billing frequency, renewal and
          cancellation arrangements will be shown before purchase.
        </p>

        <h3 id="terms-10">10. Rewards, points and virtual items</h3>
        <p>
          Unless we expressly state otherwise, Project Respawn points, XP, scores, badges, virtual items,
          cosmetics or similar in-service rewards are features of the service and are not cash, stored money,
          cryptocurrency or property redeemable for monetary value.
        </p>
        <p>
          We may correct balances or remove rewards obtained through error, fraud, manipulation or abuse.
          We will act reasonably and will not use this clause to remove paid entitlements contrary to
          applicable consumer law.
        </p>

        <h3 id="terms-11">11. Beta, experimental and work-in-progress features</h3>
        <p>
          Some Project Respawn services are in beta, testing or active development. Beta features may contain
          errors, change significantly, have limited availability or be withdrawn.
        </p>
        <p>
          You should not rely on a beta feature as the sole storage location for important information.
          Where appropriate, keep your own copies of important creator configurations or content.
        </p>

        <h3 id="terms-12">12. Intellectual property</h3>
        <p>
          Project Respawn software, branding, designs, documentation, original graphics, logos, databases,
          site content and other materials are owned by us or licensed to us, except for user content and
          third-party material.
        </p>
        <p>
          These terms give you a limited, personal, revocable, non-exclusive right to use the service for
          its intended purpose. They do not transfer ownership of Project Respawn intellectual property to you.
        </p>

        <h3 id="terms-13">13. Third-party content, links and services</h3>
        <p>
          Project Respawn may link to or integrate with third-party websites, games, marketplaces, creator
          platforms, products or services. We do not control third-party terms, content or availability.
        </p>
        <p>
          Any purchase or relationship you enter directly with a third party is generally between you and
          that third party unless Project Respawn expressly says otherwise.
        </p>

        <h3 id="terms-14">14. Moderation, suspension and termination</h3>
        <p>
          We may remove content, limit functionality, suspend or terminate access where we reasonably believe
          this is necessary because of serious or repeated rule breaches, fraud, security risks, unlawful
          activity, harm to other users, platform integrity or legal obligations.
        </p>
        <p>
          Where appropriate, we may issue warnings or allow an appeal or explanation before or after action.
          In urgent safety or security situations we may act immediately.
        </p>
        <p>
          You may stop using Project Respawn at any time and, where account deletion is available, request
          deletion subject to legal and legitimate retention requirements described in our Privacy Policy.
        </p>

        <h3 id="terms-15">15. Availability and changes to the service</h3>
        <p>
          We aim to provide a reliable service but do not promise uninterrupted or error-free availability.
          Maintenance, third-party outages, security incidents, development work or circumstances outside
          our reasonable control may affect availability.
        </p>
        <p>
          We may add, remove or change features as Project Respawn develops. Where a change materially affects
          a paid service or legal right, we will deal with it in accordance with applicable law.
        </p>

        <h3 id="terms-16">16. Disclaimers and liability</h3>
        <p>
          Project Respawn is designed to support social confidence, community participation and creator
          development, but it is not a substitute for professional medical, psychological, legal, financial
          or other regulated professional advice unless a particular service expressly says otherwise.
        </p>
        <p>
          Nothing in these terms excludes or limits liability where it would be unlawful to do so, including
          liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation,
          or mandatory consumer rights.
        </p>
        <p>
          Subject to those protections, we are not responsible for losses caused solely by third-party services,
          unauthorised use outside our reasonable control, or losses that were not reasonably foreseeable
          when the relevant contract was formed.
        </p>

        <h3 id="terms-17">17. Privacy</h3>
        <p>
          Our Privacy Policy explains how Project Respawn processes personal information. It forms an
          important companion to these terms but serves a different purpose: the terms govern use of the
          service, while the Privacy Policy explains how personal data is handled.
        </p>

        <h3 id="terms-18">18. Changes to these terms</h3>
        <p>
          We may update these terms as Project Respawn evolves, laws change or new services are introduced.
          We will update the date shown above. If a change materially affects an existing contract or paid
          service, we will provide any notice required by law.
        </p>

        <h3 id="terms-19">19. Governing law and disputes</h3>
        <p>
          These terms are governed by the laws of England and Wales, except where mandatory consumer law
          gives you the benefit of the law or courts of another part of the United Kingdom or another
          jurisdiction that cannot lawfully be excluded.
        </p>
        <p>
          Please contact us first if you have a concern so we have an opportunity to resolve it.
        </p>

        <h3 id="terms-20">20. Contact</h3>
        <p>
          Questions about these terms can be sent to:
        </p>
        <p>
          <strong>Nicholas Grefsheim / Ravens Community Gaming Ltd</strong><br>
          <strong>Project Respawn</strong><br>
          <strong>Email:</strong> Help@Projectrespawn.com<br>
          <strong>Address:</strong> Ravens Community Gaming, 61 Bridge Street, Kington, HR5 3DJ, United Kingdom
        </p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const activeSummary = ref('account')

const summaries = [
  {
    id: 'account',
    label: 'Your Account',
    title: 'Your Project Respawn Account',
    text: 'Keep your information accurate, protect your login and do not use extra accounts to bypass restrictions.',
    points: []
  },
  {
    id: 'community',
    label: 'Community',
    title: 'Community Rules',
    text: 'Project Respawn should be used lawfully and respectfully. Harassment, scams, abuse, manipulation and attempts to damage or compromise the platform are not allowed.',
    points: []
  },
  {
    id: 'creator',
    label: 'Creator Tools',
    title: 'Creator Tools & Integrations',
    text: 'You can connect supported third-party services where authorised. Their own rules still apply, and Project Respawn cannot guarantee that external platforms will remain available or compatible.',
    points: []
  },
  {
    id: 'payments',
    label: 'Payments',
    title: 'Payments & Memberships',
    text: 'Prices and key purchase terms will be shown before checkout. Mandatory UK consumer rights continue to apply and are not removed by these terms.',
    points: []
  },
  {
    id: 'content',
    label: 'Your Content',
    title: 'Your Content',
    text: 'You keep ownership of content you create. You give Project Respawn the limited rights needed to host, display, moderate and operate features that use that content.',
    points: []
  },
  {
    id: 'beta',
    label: 'Beta Features',
    title: 'Beta & Work in Progress',
    text: 'Some Project Respawn features are still being tested. They may change, fail, have limited availability or be withdrawn while the product develops.',
    points: []
  }
]

const currentSummary = computed(
  () => summaries.find(section => section.id === activeSummary.value) ?? summaries[0]
)

const toc = [
  { id: 'terms-1', label: '1. About these terms' },
  { id: 'terms-2', label: '2. Eligibility & age' },
  { id: 'terms-3', label: '3. Accounts' },
  { id: 'terms-4', label: '4. Acceptable use' },
  { id: 'terms-5', label: '5. User content' },
  { id: 'terms-6', label: '6. Creator Tools' },
  { id: 'terms-7', label: '7. Applications' },
  { id: 'terms-8', label: '8. Scores & analytics' },
  { id: 'terms-9', label: '9. Payments' },
  { id: 'terms-10', label: '10. Rewards' },
  { id: 'terms-11', label: '11. Beta features' },
  { id: 'terms-12', label: '12. Intellectual property' },
  { id: 'terms-13', label: '13. Third parties' },
  { id: 'terms-14', label: '14. Suspension' },
  { id: 'terms-15', label: '15. Availability' },
  { id: 'terms-16', label: '16. Liability' },
  { id: 'terms-17', label: '17. Privacy' },
  { id: 'terms-18', label: '18. Changes' },
  { id: 'terms-19', label: '19. Governing law' },
  { id: 'terms-20', label: '20. Contact' }
]
</script>
