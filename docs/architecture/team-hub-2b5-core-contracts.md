# Team Hub 2B5 — Shared/Core contracts

6 October 2026. **OFFLINE CANDIDATE; NOT DEPLOYED.** Read the [migration control](README-PHASE2-MIGRATION.md) and [dependency gate](team-hub-2b5-cutover-dependency-review.md). No Cognito replacement, account migration, user/group changes or AWS writes.

## Architecture assessment

Owner: Shared/Core, identity and bounded capability/directory module. Existing Cognito remains physically Legacy-owned and is a do-not-move protected identity. Team membership, roles, rosters, champion pools, assessments, plans and resource authorization stay Team Hub-owned. No new shared business database.

A small independent `ProjectRespawn-Core-Ntgre` root publishes a versioned synchronous Lambda API; it does not need a new public API Gateway or another Cognito pool. The Team runtime invokes the exact same-account function ARN using its own AWS credentials. IAM authenticates the service; the Core handler independently verifies the delegated Cognito access token. No caller-supplied actor/subject is accepted. This is a service API, not a public directory endpoint. IAM bootstrap/caller/execution lifecycle remains a separate unresolved deployment preparation item; no usable live Core endpoint is claimed.

Core product proposal: six declarations (function, runtime role, log group, cursor-signing secret, two alarms). Runtime boundary: one declaration. Reserve four more security declarations for reviewed execution identity/boundary and restricted deployment caller/policy. Core owns its cursor secret; it is generated only on a separately authorized deployment. No secret value is included in source. Secret retrieval/default service-encryption behavior and rotation must pass live validation. No shared-business KMS or foreign data access.

## Exact dependencies

| Workflow | Core dependency | Team-owned decision |
|---|---|---|
| All requests | environment.v1; fresh enabled-account check through authorization contract | Strong Team membership/role and version where applicable |
| CREATE_TEAM | authorization.decision.v1: teams.admin | Deterministic slug claim and transaction |
| UPDATE_TEAM, SET_TEAM_PLAN | teams.admin | Existing Team, versions, plan/settings state |
| SET_MANAGER | teams.admin; directory.assignment.v1 for ASSIGN | Manager lifecycle, previous role revocation, epoch/roster cleanup |
| MANAGE_MEMBER | directory.assignment.v1 for ASSIGN | Active Manager membership, allowed target role and revisions |
| Directory search | bounded directory.assignment.v1 | Active Manager or teams.admin, exact Team scope, checked before delegation |
| Display/profile enrichment | No live profile contract | Team-owned assignment display snapshot and subject reference |

`environment.v1` is validated by [contracts.mjs](../../domains/shared-core/contracts.mjs) against the existing Ntgre account/region/pool/client/issuer descriptor. It does not accumulate arbitrary feature flags. `profile.summary.v1` is deliberately not implemented: current DTOs can operate with membership snapshots; no synchronous profile dependency is necessary.

## Global capability rule and product evidence

The [current dependency map](team-hub-current-dependency-map.md) explicitly records Admin/SuperAdmin creation rights. [Legacy policy](../../amplify/myFunction/teamHub/policy.ts) calls `assertPlatformAdmin`; [shared auth](../../amplify/myFunction/shared/auth.ts) names only Admin and SuperAdmin. This is existing product evidence, not an assumption that every role called admin may create Teams.

The candidate maps fresh Cognito Admin/SuperAdmin membership to `teams.admin`. Staff, Creator, Coach, Manager and Player do not acquire that capability merely from their product roles. A platform admin does not become Team Manager or gain Coach-private access. Core reads enabled/confirmed account state and groups for each decision; JWT group claims are ignored for grants. Decisions bind subject, environment, capability and a maximum five-second validity; no shared grant cache. The client rechecks at command authorization/replay. Cognito decisions and DynamoDB commits are not one distributed transaction; a group change racing the final check remains a bounded external dependency race, not proof of instantaneous cross-service revocation. Freeze capability administration during the cutover gate and test revocation behavior live.

`teams.branding.manage` is recognized but returns false for this initial candidate because all branding operations are disabled (option A). Historical Staff permission-table semantics are not silently copied or dropped into a general Core permission service. A later branding gate must explicitly preserve/review those grants before re-enabling logo operations.

## Directory and transport

[Core service](../../domains/shared-core/service.mjs), [AWS/JWT entry](../../domains/shared-core/entry.mjs), [Team client](../../domains/team-hub/cutover/core-client.mjs).

- Core alone receives exact-pool `AdminGetUser`, `AdminListGroupsForUser` and `ListUsers`. It receives no user mutation or group mutation privileges. Team receives none of these Cognito actions.
- Exact assignment resolution filters normalized email, rejects missing/ambiguous/incomplete results, and freshly checks canonical subject, enabled status and CONFIRMED state. This preserves the current local-account eligibility rule; federated/unconfirmed account expansion is not implied.
- Search is a bounded email-prefix query (2–100 characters, limit 1–10). It does not reproduce the old three-filter broad search. UI must label the supported search purpose accurately.
- Results expose only subject and display name. Raw email, enabled flags, Cognito attributes and provider tokens are not returned.
- AES-GCM pagination encrypts the provider cursor and binds subject, issuer, Team, query, limit and a five-minute expiry. Disabled users are omitted after fresh lookup. Empty pages may still have a next token.
- The Team service, not Core, verifies Manager/global capability before directory delegation and rechecks assignment during commit preparation. Core trusts only the reviewed IAM-authenticated Team service for that resource-specific decision; it does not query Team data or accept browser assertions of Manager status.
- Core JWT verification uses the pinned `aws-jwt-verify` library, fixed pool/client, access-token purpose and issuer. Signature tampering, expiry, wrong client/environment and body identity substitution are tested. Tokens are passed only in the invocation payload and never logged or stored.
- Outage, malformed response, missing signing secret or disabled actor fails closed. No Legacy AppSync fallback.

## Candidate status and remaining acceptance

The isolated packages contain pinned locks; both Core and Team runtime bundles were built offline. [Build evidence](team-hub-2b5-evidence-2026-10-06/build.json). Core is **not live**. Required before acceptance: full restricted Core deployment security/lifecycle proposal; pinned publication and change-set inspection; actual-role positive/negative validation; IAM invocation trust and delegated JWT live tests; directory privacy/revocation/pagination tests against approved identities; default secret-encryption path; named alarm recipient and cursor key rotation. No deployment or credential creation is authorized by this document.

AWS references: [AdminListGroupsForUser](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminListGroupsForUser.html) documents IAM authorization and username/sub handling. [DynamoDB policy support](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/rbac-iam-actions.html) is used by the companion source-fence proposal. Repository source and executable tests remain the authority for application rules.
