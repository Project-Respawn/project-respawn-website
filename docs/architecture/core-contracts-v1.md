# Core contracts v1

6 October 2026. Candidate, not a live accepted endpoint. [Plan](core-domain-plan.md), [security](core-security-model.md), [runtime contracts](../../domains/shared-core/contracts.mjs).

## environment.v1

Static validated descriptor: environment Ntgre, account 058264289478, region eu-north-1, existing pool `eu-north-1_n24iLL7QE`, public website client `1iq7ovjaf7d16imdvbqgfgvf86`, issuer `https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE`, contract version. Fresh read-only pool/client evidence confirms one website client and no client secret. Other configuration and credentials are not returned. No runtime environment endpoint is created. [Identity evidence](core-2b5a-evidence-2026-10-06/identity.json).

## Common transport and trust

Synchronous IAM-authenticated Lambda Invoke of the exact Core function, no async event invocation workflow or browser access. Each request carries environment, contractVersion and delegated accessToken. JWT signature, issuer, client_id, access purpose, expiry, nbf and canonical subject are checked. Caller-supplied subject/actor or unrecognized fields are rejected. Core performs a fresh enabled/CONFIRMED account lookup, never trusts JWT groups for a grant, and returns `{ok:true,data}` or a bounded `{ok:false,error:{code}}` envelope.

No tokens, query/account strings, raw Cognito responses, subject or provider exception detail enter application logs. Structured logs contain request ID, allowlisted contract/outcome, duration and aggregate metrics. JWT/JWKS verification failures return UNAUTHENTICATED; dependency errors return DEPENDENCY_UNAVAILABLE; all fail closed. No fallback to Legacy or another environment. Client transport failures also fail closed.

## authorization.decision.v1

Input adds exactly capability. Supported values: teams.admin and teams.branding.manage. Output is subject reference, environment, requested capability, boolean allowed, decisionVersion, evaluatedAt and expiresAt (maximum five seconds). Admin/SuperAdmin in fresh Cognito group lookup map to teams.admin. Existing [Legacy policy](../../amplify/myFunction/teamHub/policy.ts), [shared auth](../../amplify/myFunction/shared/auth.ts) and [dependency map](team-hub-current-dependency-map.md) establish this product rule. Manager/Coach/Player/Creator/Staff do not acquire global administration by implication.

teams.branding.manage is recognized but always denied while branding is deferred. Historical Staff/global permission-table semantics are not invented or migrated. Global admin does not become Team Manager or gain private Coach data. Team independently authorizes its business resource. Revocation is checked afresh; Cognito and a later Team transaction are not a distributed atomic operation.

## directory.assignment.v1

Only the trusted Team service delegates assignment lookup after checking active Manager or applicable global capability and exact Team scope. Core does not own/read Team memberships and does not accept a browser's assertion of role. Core itself verifies the delegated account is active. Team must repeat its business checks before mutation.

Input: action resolve or search, exact Team reference. Resolve accepts a normalized email account identifier (maximum 254 characters), requires exactly one complete matching result and a fresh eligible-user lookup. Search accepts an email prefix of 2–100 allowlisted characters, limit 1–10, optional nextToken. No unbounded list/all-user operation. Disabled or unconfirmed results are omitted; unsupported federation/account eligibility remains unchanged.

Outputs contain subject and displayName only, with optional encrypted nextToken. Email/phone/groups/provider attributes/internal metadata are not returned. Display label uses existing name/preferred_username or a neutral fallback, maximum 100 characters. AES-GCM pagination binds actor, issuer, Team, query and limit for five minutes; raw provider tokens are never exposed. Empty pages may still carry a cursor. Cursor secret is generated in Secrets Manager only on separately authorized deployment.

Directory calls are limited to 30/minute per authenticated subject per warm execution environment; map bounded to 1,000 actors. This is an abuse brake, **not a global quota across execution environments or cold starts**. Reserved concurrency five bounds in-flight provider load. Team integration must retain its route throttling and service authorization; no generic public directory is opened. RATE_LIMITED is a bounded failure and never authorizes fallback/retry storms.

## profile.summary.v1 and compatibility

Not implemented: current Team DTOs use Team-owned display snapshots and subject references. This avoids unnecessary synchronous coupling. New contract versions require compatibility testing; no automatic consumer deployments. [Planned endpoint](core-2b5a-evidence-2026-10-06/planned-endpoint.json) is explicitly PLANNED_NOT_DEPLOYED with null deployment revision. Publish accepted config only after live acceptance, without modifying amplify_outputs.json.

Offline coverage includes real signed/tampered JWT verification, wrong issuer/client/environment/subject, missing token, capability grants/revocation, directory bounds/pagination/privacy, disabled users, provider outage and rate controls. The future live matrix must reproduce supported cases with approved accounts and injected error fixtures; do not disable real accounts or Cognito service permissions just to test failure without separate approval.
