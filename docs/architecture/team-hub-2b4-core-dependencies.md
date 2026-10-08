# Team Hub 2B4 Core dependencies

6 October 2026. [Migration control](README-PHASE2-MIGRATION.md). No Core service is invented or deployed by this task.

| Contract | Current evidence | 2B4 treatment | Cutover requirement |
|---|---|---|---|
| environment.v1 | Existing same-environment issuer/pool/client/account/region contract; live preview JWT unchanged | Reused without Cognito changes | Preserve and verify |
| authorization.decision.v1 | Offline SyntheticCore only; no accepted live endpoint in current domain configuration | VerificationCore grants teams.admin only to exact configured test administrators inside a named synthetic Team run | Real owner-authorized transport, freshness/revocation and outage semantics |
| directory.assignment.v1 | Offline account fixtures; no accepted live service | Exact configured test-account intent maps to configured Cognito subject/display label; unknown account rejected | Bounded purpose-authorized live directory and subject resolution |
| profile.summary.v1 | Contract/synthetic adapter only | Approved test display labels; no profile writes or raw Cognito access | Reviewed owner profile contract where required |

CREATE_TEAM, UPDATE_TEAM, SET_MANAGER and SET_TEAM_PLAN require teams.admin, never merely a valid JWT or Manager membership. SET_MANAGER and MANAGE_MEMBER assignments additionally need directory resolution. Managers/Coaches/Players cannot acquire global capability through a request field, group claim, UI flag or test prefix. The exact accepted [authorization matrix](team-hub-authorization-matrix.md) remains controlling.

The [verification adapter](../../domains/team-hub/parity/core.mjs) has no service fallback and never calls Legacy AppSync, Cognito Admin, Creator or another domain. It first enforces the immutable run scope/lease and actor allowlist. Candidate environment is DISABLED; no live test principals were selected or authorized. An eventual verification lease must bind real existing Ntgre Cognito issuer/sub pairs, exact synthetic Team IDs and at most six hours. Every normal-user request remains denied. This proves controllable test authorization, not production Core availability.

Core dependencies block live business CREATE_TEAM and real-user cutover. They do not require inventing a new pool or moving users. Live verification is a separately reviewed synthetic exercise, not a Core production implementation.
