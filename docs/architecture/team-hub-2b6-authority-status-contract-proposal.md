# Team Hub browser authority-status contract — separate review required

**Superseded source-only forecast:** implementation and corrected 42-resource deployment candidate are now prepared in [endpoint readiness](team-hub-authority-status-endpoint-readiness.md). The original 41-resource forecast below omitted the necessary exact API-to-Lambda invoke permission. Nothing is deployed; use the new pin, never the old forecast.

8 October 2026. This is a source contract proposal, not a deployable or executed backend candidate. Accepted D1 templates, runtime archive, runtime identities and boundaries remain unchanged. The real authority is LEGACY_WRITER, epoch 1, version 1.

## Why Gate E cannot receive live acceptance yet

The deployed D1 dark handler denies normal HTTP business requests and has no browser authority-status operation. C2 permits the runtime to read the exact authority partition, but permission alone does not expose a contract. The dormant frontend must not infer authority from deployment configuration or invent a future epoch.

## Proposed minimum contract

- `GET /v1/authority`, existing Ntgre HTTP API, existing JWT authorizer, existing ParityRead integration and role.
- Authenticate trusted API Gateway access-token claims against the accepted Ntgre environment before reading anything. Ordinary authenticated users may read this non-personal status.
- Exactly one strongly consistent GetItem on `ProjectRespawn-TeamHub-Ntgre-Journal`, PK `CONTROL#AUTHORITY`, SK `STATE`. Runtime code fixes both keys; C2 IAM fixes the table and partition.
- Validate the approved control schema, keys, mode, positive safe integer epoch/version and audit metadata. Missing, malformed or unavailable state returns 503 with no private error details. No writes, scanning, cursor secret, Cognito administration, cross-domain database access or IAM addition.
- Return only `contractVersion=team-hub.authority-status.v1`, domain, environment, account, region, mode, epoch, version and server `observedAt`. Do not expose changedBy, gateDigest, identity, tokens or business data. Response is `Cache-Control: no-store`.
- Existing routes retain exactly their accepted D1 behavior and metrics. The future Read wrapper must add the route explicitly while preserving the original handler for every other event, and emit reviewed status/configuration metrics using bounded dimensions. That wrapper, compiled asset and any exact publication-policy updates require a new separately reviewed pin; they are not included in or substituted for D1.

Expected minimum product delta: one JWT route addition and one existing Read Lambda code update, 40 to 41 product resources; zero stateful changes, replacements, deletions or runtime IAM changes. The Command Lambda must remain on D1. This is an expected design delta, not an AWS-generated change-set result. The [pinned proposal](team-hub-ef-evidence-2026-10-08/authority-contract-proposal.json) records the route fragment and exact source/manifest hashes.

## Dormant frontend behavior

The client reads fresh server status before each business call, using the same current session token. It checks exact response fields, accepted domain/environment/account/region, positive epoch/version and observation freshness (30 seconds maximum age; 5 seconds future clock tolerance). It rejects non-TARGET modes and any epoch different from the separately reviewed activation epoch. The business header comes from the validated server response. No cached authority, fixture epoch, Legacy fallback, branding operation or automatic activation is permitted. The live activation proposal has `reviewed: false` and `epoch: null`.

This is defense in depth, not writer enforcement. Authority can change after the GET; Gate C must atomically condition business transactions on the actual control mode/epoch/version and reject missing/stale epochs. The client never grants business authorization.

## Verification and future execution gate

The new handler/client tests cover exact strong reads, ordinary authentication, no unauthenticated read, malformed/missing state, wrong environment/account, stale/future/missing epoch, invalid version, observation expiry, private-field rejection, fresh per-call state, intervening freeze and disabled branding/activation. Browser rehearsals use an explicitly isolated server-side authority record and live Core authentication; they are not live Journal binding proof.

Before deployment, review/build the wrapper and artifact publication delta; inspect a separately pinned change set and its IAM effects. After separately authorized deployment, prove live JWT rejection, real LEGACY epoch/version 1, no personal data/caching, all existing normal-route denials, D1 telemetry preservation and unchanged real business state. Live TARGET success and transactional race proof remain maintenance/business-runtime gates. Do not change authority, attach a source fence or enable the website for this contract review.
