# Public Creator Programme submission

`/apply-now` submits accountless Creator Programme applications through the API-key-authorised `submitPublicApplication` command. Guests receive no model CRUD and cannot call the authenticated admin list/detail commands.

The browser sends the `creator-v1` payload, matching contact-email confirmation, `creator-consent-v1`, a stable retry token, and a honeypot. The server normalises only surrounding whitespace and the email domain, validates the complete aggregate, rejects closed pathways and protected fields, applies payload limits and hourly source/email throttling, and supplies trusted provenance itself. It then delegates to `storeTrustedApplicationSubmission` and returns only the reference, durable submission timestamp, and confirmation status.

Public records retain `emailVerificationState: UNVERIFIED`. No verification challenge, SES delivery, Cognito user creation, SMTP check, or provider-specific email rewriting occurs. Account identity can be verified later during induction.

The normal Admin Applications queue uses `listAdminApplications` with backend pagination and opens stored detail through `getAdminApplication`. `APP-DEMO-0001` remains available only through the explicit demo branch used by fictional review workflows.

The `scripts/test-public-application-sandbox.mjs` harness exercises the public AppSync command, retry idempotency, authorised admin list/detail, guest and Staff denial, email mismatch and malformed email rejection, and exact marked-record cleanup in protected `Ntgrestage8`.
