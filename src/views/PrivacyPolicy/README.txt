PROJECT RESPAWN LEGAL CENTRE
=============================

Files
-----
MainPrivacyPolicy.vue
PrivacyPolicyContent.vue
TermsConditionsContent.vue

Install
-------
Place all three files in:

src/views/PrivacyPolicy/

The existing /privacy-policy route can continue pointing to MainPrivacyPolicy.vue.
No router change should be required if that is how the current project is configured.

What changed
------------
- One page with Privacy Policy / Terms & Conditions selector.
- Privacy and terms content split into separate Vue components.
- Lightweight Vue interactions only.
- Responsive shared styling kept in MainPrivacyPolicy.vue.
- Replit retained as beta app hosting/infrastructure.
- AWS added for wider Project Respawn cloud infrastructure.
- Cognito described as authentication/identity management rather than "the database".
- Coverage added for Creator Tools, Twitch/Discord, applications, Creator Score,
  Community Score, brand insight, payments, younger users and beta services.

Important
---------
This is a strong working draft, not a substitute for professional legal advice.
Before full public launch, have a UK solicitor/privacy specialist review:
- treatment of confidence/wellbeing data and any special-category processing;
- Children's Code / age-appropriate design compliance;
- exact retention periods;
- international transfer mechanisms used by each processor;
- paid memberships, refunds and consumer-contract wording;
- the final legal controller if Project Respawn Ltd replaces Ravens Community Gaming Ltd.
