<template>
  <div class="privacy-container mx-auto" >
    <h1>Privacy at Project Respawn</h1>
    <p class="intro-text">
      This page explains what data we collect, why we collect it, and how you
      stay in control of it when you use Project Respawn.
    </p>

    <!-- Quick overview -->
    <div class="overview-grid">
      <div class="overview-card">
        <div class="overview-card-title">👤 What we collect</div>
        <div class="overview-card-content">
          Account details, confidence and quest progress, social connections,
          payments, and basic device/security info.
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-card-title">🎯 Why we collect it</div>
        <div class="overview-card-content">
          To run your account, track progress, deliver rewards, keep the
          platform secure, and understand what’s working.
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-card-title">🛡️ Who sees it</div>
        <div class="overview-card-content">
          Your data is mainly used inside Project Respawn. We use Replit
          (hosting), Microsoft (email), and Revolut (payments).
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-card-title">✅ Your choices</div>
        <div class="overview-card-content">
          You can download your data, delete your account, change some
          settings, and contact us to exercise your data rights.
        </div>
      </div>
    </div>

    <!-- Explainer selector -->
    <div class="section-buttons">
      <button v-for="section in sections" :key="section.id" type="button" 
        :class="['section-btn', { active: activeSection === section.id }]" 
        @click="activeSection = section.id">
        {{ section.label }}
      </button>
    </div>

    <div v-if="currentSection" class="section-summary">
      <div class="section-summary-title">
        {{ currentSection.label }}
      </div>
      <div v-html="currentSection.summary"></div>
    </div>

    <!-- Full policy -->
    <div class="policy-content">
      <h2>Project Respawn Privacy Policy</h2>
      <p><em>Last updated: 2 April 2026</em></p>

      <h3>1. Who we are</h3>
      <p>
        Project Respawn is a social confidence gamification platform designed
        to help people with social anxiety build confidence through quests,
        progression and community.
      </p>
      <p>
        <strong>Data controller:</strong> Nicholas Grefsheim / Ravens Community Gaming Ltd<br />
        <strong>Trading name:</strong> Ravens Community Gaming LTD<br />
        <strong>Contact email:</strong> Help@Projectrespawn.com<br />
        <strong>Postal address:</strong> Ravens Community Gaming, 61 Bridge Street,
        Kington, HR5 3DJ, United Kingdom
      </p>
      <p>
        Project Respawn is based in the United Kingdom and the UK Information
        Commissioner’s Office (ICO) is the supervisory authority for UK GDPR matters.
      </p>

      <h3>2. What data is collected and why</h3>
      <p>
        We only collect the information needed to run Project Respawn, secure
        the service, and support the user experience.
      </p>

      <h4>2.1 Account and profile information</h4>
      <p><strong>What is collected</strong></p>
      <ul>
        <li>Email address</li>
        <li>Username</li>
        <li>Password (stored as a secure hash, never in plain text)</li>
        <li>Basic profile details, such as avatar or short bio when enabled</li>
        <li>Privacy and notification settings</li>
      </ul>
      <p><strong>What it is used for</strong></p>
      <ul>
        <li>Creating and managing accounts</li>
        <li>Allowing secure login</li>
        <li>Displaying the user profile in the app</li>
        <li>Remembering settings and privacy choices</li>
      </ul>
      <p><strong>Lawful basis</strong></p>
      <p>
        <strong>Contract</strong> — this information is needed to create the
        account and provide the service you signed up for.
      </p>

      <h4>2.2 Confidence, quests and pet data</h4>
      <p><strong>What is collected</strong></p>
      <ul>
        <li>Confidence level / XP score</li>
        <li>Quests assigned, completed or skipped</li>
        <li>Streaks and progress history</li>
        <li>Interactions with the virtual companion or pet</li>
      </ul>
      <p><strong>What it is used for</strong></p>
      <ul>
        <li>Tracking progress and unlocking new quests</li>
        <li>Providing feedback and progression</li>
        <li>Powering the core confidence-building experience</li>
      </ul>
      <p><strong>Lawful basis (current approach)</strong></p>
      <p>
        <strong>Legitimate interests</strong> — we have a genuine interest in
        providing a confidence-building progression system that users expect
        when they sign up, while limiting data use, explaining how it works,
        and allowing account and data deletion.
      </p>
      <p>
        We are seeking ICO guidance on whether confidence data in this context
        should be treated as special category health data or as high-risk
        ordinary personal data. This notice will be updated if that position changes.
      </p>

      <h4>2.3 Social features</h4>
      <p><strong>What is collected</strong></p>
      <ul>
        <li>Friends and followers</li>
        <li>Invitation relationships</li>
        <li>Participation in social features, when enabled</li>
      </ul>
      <p><strong>What it is used for</strong></p>
      <ul>
        <li>Letting users add friends and use social features</li>
        <li>Enabling social quests and community functionality</li>
        <li>Showing limited profile information according to user settings</li>
      </ul>
      <p><strong>Lawful basis</strong></p>
      <p>
        <strong>Contract</strong> — these are core features you choose to use
        as part of the service.
      </p>

      <h4>2.4 Rewards and tokens</h4>
      <p><strong>What is collected</strong></p>
      <ul>
        <li>In-app token balances</li>
        <li>Items, perks or rewards redeemed</li>
        <li>Redemption history</li>
      </ul>
      <p><strong>What it is used for</strong></p>
      <ul>
        <li>Running the in-app reward and token system</li>
        <li>Preventing abuse and resolving redemption issues</li>
      </ul>
      <p><strong>Lawful basis</strong></p>
      <p>
        <strong>Contract</strong> — needed to provide the reward system you choose to use.
      </p>

      <h4>2.5 Communications</h4>
      <p><strong>What is collected</strong></p>
      <ul>
        <li>Transactional emails, such as password reset, email change and security alerts</li>
        <li>Beta or waitlist emails where you sign up for them</li>
      </ul>
      <p><strong>What it is used for</strong></p>
      <ul>
        <li>Keeping accounts secure</li>
        <li>Sending beta access codes or similar information you requested</li>
        <li>Sending important service notices</li>
      </ul>
      <p><strong>Lawful basis</strong></p>
      <p>
        <strong>Contract</strong> — for essential account and security emails.<br />
        <strong>Consent</strong> — for beta, waitlist or similar optional email lists.
      </p>

      <h4>2.6 Device, security and log data</h4>
      <p><strong>What is collected</strong></p>
      <ul>
        <li>IP address and basic device/browser details</li>
        <li>Security-related logs, such as failed logins or suspicious activity</li>
        <li>Technical error logs with personal data minimised</li>
      </ul>
      <p><strong>What it is used for</strong></p>
      <ul>
        <li>Keeping the platform secure and preventing abuse</li>
        <li>Detecting and fixing bugs and outages</li>
        <li>Monitoring unusual activity that could indicate a security incident</li>
      </ul>
      <p><strong>Lawful basis</strong></p>
      <p>
        <strong>Legitimate interests</strong> — maintaining security and
        reliability is in both your interests and ours.
      </p>

      <h4>2.7 Payments and purchases</h4>
      <p><strong>What is collected</strong></p>
      <ul>
        <li>Basic transaction details (amount, currency, time, what was purchased)</li>
        <li>Limited payment metadata (such as card brand and last four digits)</li>
        <li>Billing email and, where needed, billing country or address</li>
      </ul>
      <p><strong>What is not collected</strong></p>
      <ul>
        <li>Full card number</li>
        <li>Full card security code (CVV)</li>
        <li>PIN</li>
      </ul>
      <p>
        These payment credentials are handled directly by the payment provider
        rather than stored by Project Respawn.
      </p>
      <p><strong>What it is used for</strong></p>
      <ul>
        <li>Taking payment and providing your purchase</li>
        <li>Preventing and investigating fraud or payment abuse</li>
        <li>Handling refunds and resolving payment disputes</li>
      </ul>
      <p><strong>Lawful basis</strong></p>
      <p>
        <strong>Contract</strong> — payment information is needed to fulfil purchases.<br />
        <strong>Legitimate interests</strong> — monitoring and preventing fraud or abuse.
      </p>

      <h4>2.8 Future optional features (not yet live)</h4>
      <p>
        Planned but not yet enabled features may include optional in-app
        surveys, event-style tracking to understand which quests work best,
        and optional coarse location checks to validate certain quests. These
        will be clearly explained before launch and are expected to rely on
        consent. This policy will be updated when those features go live.
      </p>

      <h3>3. How long data is kept</h3>
      <ul>
        <li>Active accounts: while your account is active, and potentially deleted after around 12 months of inactivity
          following warning notices.</li>
        <li>Quest history, pet data, friends and follows: while your account exists, then deleted when your account is
          deleted.</li>
        <li>Reward and redemption records: around 12 months after redemption.</li>
        <li>Security tokens: deleted automatically on use or expiry.</li>
        <li>Session data: usually up to 7 days.</li>
        <li>Beta or waitlist emails: around 30 days after a code is used or the beta closes, unless you withdraw consent
          sooner.</li>
      </ul>

      <h3>4. Who data is shared with</h3>
      <ul>
        <li><strong>Replit (hosting and database)</strong> – hosts the application and stores data.</li>
        <li><strong>Microsoft (Outlook / Microsoft 365)</strong> – sends account-related emails such as password resets
          and important notifications.</li>
        <li><strong>Revolut Payments</strong> – processes card payments and other payment methods.</li>
      </ul>

      <h3>5. International transfers</h3>
      <p>
        Some providers may process data outside the UK. Where that happens, we
        aim to rely on appropriate safeguards such as standard contractual
        clauses (SCCs), the UK International Data Transfer Agreement (IDTA),
        and additional measures where needed.
      </p>

      <h3>6. Your rights</h3>
      <ul>
        <li>Access – ask for a copy of your data.</li>
        <li>Correction – ask us to fix inaccurate or incomplete data.</li>
        <li>Deletion – ask us to delete some or all of your data in certain situations.</li>
        <li>Restriction – ask us to limit how we use your data in certain situations.</li>
        <li>Objection – object to some uses of your data, especially where we rely on legitimate interests.</li>
        <li>Portability – in some cases, receive your data in a format you can move to another service.</li>
      </ul>
      <p>
        You can use in-app tools (such as data download and account deletion)
        or contact us at Help@Projectrespawn.com.
      </p>

      <h3>7. Cookies and similar technologies</h3>
      <p>
        We currently use a single session cookie so you can stay logged in while
        using the app. It is strictly necessary for security and for the service
        to function.
      </p>
      <p>
        We do not currently use analytics, advertising or tracking cookies. If
        we add non-essential cookies in future, we will update this notice and
        ask for consent where required.
      </p>

      <h3>8. Automated decisions and profiling</h3>
      <p>
        The app calculates a confidence level and may show leaderboards based on
        your in-app activity. This is a form of profiling inside the app, but it
        is intended only to affect your in-app experience.
      </p>

      <h3>9. Children and vulnerable users</h3>
      <p>
        Project Respawn is intended for users aged 13 and over. We ask you to
        confirm your age when you sign up.
      </p>
      <p>
        Because the platform is aimed at people with social anxiety, we design
        it on the basis that users may be vulnerable.
      </p>

      <h3>10. Security</h3>
      <p>
        We have implemented technical measures including stripping password
        hashes from API responses, securing session cookies, supporting full
        account deletion, adding personal-data export capability, cleaning up
        expired tokens, and minimising personal data in logs.
      </p>

      <h3>11. Changes to this policy</h3>
      <p>
        We may update this privacy policy from time to time, for example when
        we add new features, change how we use data, or introduce new providers.
      </p>

      <h3>12. Contact and complaints</h3>
      <p>
        If you have questions about this privacy policy or how we use your data, contact:
      </p>
      <p>
        <strong>Nicholas Grefsheim / Ravens Community Gaming Lets</strong><br />
        <strong>Project Respawn</strong><br />
        <strong>Email:</strong> Help@Projectrespawn.com<br />
        <strong>Address:</strong> Ravens Community Gaming, 61 Bridge Street, Kington, HR5 3DJ, United Kingdom
      </p>
      <p>
        You can also complain to the Information Commissioner’s Office if you’re unhappy with how your data is handled.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const sections = [
  {
    id: 'data',
    label: 'What we collect',
    summary:
      'We collect account details (email, username, password hash), confidence and quest data, social connections, rewards, basic device/security logs, and payment transaction details (but not full card numbers or CVV).'
  },
  {
    id: 'reasons',
    label: 'Why we collect it',
    summary:
      'We use your data to run your account, track your progress, unlock quests and rewards, enable social features, keep the service secure, process payments and understand what works in Project Respawn.'
  },
  {
    id: 'sharing',
    label: 'Who we share with',
    summary:
      'We do not sell your data. We use Replit to host the app, Microsoft to send account emails, and Revolut to process payments.'
  },
  {
    id: 'rights',
    label: 'Your rights',
    summary:
      'You can download your data, ask us to correct it, delete your account, object to some uses, restrict some processing and, in some cases, ask us to send your data to you or another service.'
  },
  {
    id: 'future',
    label: 'Future features',
    summary:
      'We are considering optional surveys, event-style tracking and coarse location checks to validate certain quests. These will be clearly explained and opt-in before they go live.'
  }
]

const activeSection = ref('data')

const currentSection = computed(() =>
  sections.find((section) => section.id === activeSection.value)
)
</script>

<style scoped src="./PrivacyPolicy.css"></style>
