# Ntgre role test accounts

These accounts belong only to the existing protected Ntgre Cognito pool, resolved and validated from `amplify_outputs.json`. They use the non-deliverable `respawntest.test` domain. No invitations are sent. Each account has exactly its named Cognito group; no additional application-specific team, brand or resource membership is implied.

| Login email | Group |
|---|---|
| superadmin@respawntest.test | SuperAdmin |
| admin@respawntest.test | Admin |
| staff@respawntest.test | Staff |
| moderator@respawntest.test | Moderator |
| trainer@respawntest.test | Trainer |
| therapist@respawntest.test | Therapist |
| streamingpartner@respawntest.test | StreamingPartner |
| affiliatepartner@respawntest.test | AffiliatePartner |
| member@respawntest.test | Member |
| betamember@respawntest.test | BetaMember |

From the repository terminal, set a password and confirm all ten accounts:

```powershell
node scripts/ntgre-role-test-accounts.mjs passwords
```

The command prompts twice with hidden input, sets one shared password for these test accounts, and verifies `CONFIRMED` status. Use at least eight characters with uppercase, lowercase, a number and a symbol. It uses your local AWS `default` profile. No password is written to a file, printed, passed as a command argument or committed. Do not paste passwords into chat.

Accounts initially have `FORCE_CHANGE_PASSWORD` status after suppressed creation. The command sets a permanent password, so the normal localhost login works without a first-login password-change screen or email verification. Email attributes are administratively verified only for these fake test identities. For later password resets, run the same local command; fake mailboxes cannot receive recovery messages.

Sign out of localhost before switching accounts. Sign in at `http://localhost:5174` with the appropriate email and the password you selected. Role-specific application data may require separate fixtures; account creation does not seed business data. These users are not production users.

Read-only status:

```powershell
node scripts/ntgre-role-test-accounts.mjs status
```

The `create` mode creates missing identities with messaging suppressed and adds the matching existing group. It refuses unexpected additional group membership. No pool, client, group definition, Lambda, CloudFormation stack or production configuration is changed.
