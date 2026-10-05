# Team Hub v1 authorization and privacy matrix

Phase 2B1 offline reference. Existing same-environment Cognito signs identity; Team Hub owns membership and Core owns fresh global capability decisions. The HTTP boundary takes only API Gateway JWT-authorizer claims. Signature verification belongs to that authorizer; the service independently checks issuer, approved client, expiry/not-before, access-token purpose and canonical subject. An arbitrary body identity, decoded bearer, email or global group claim cannot authorize a request.

| Operation | Admin capability | Branding capability | Active Manager | Active Coach | Active Player |
|---|---|---|---|---|---|
| LIST_MY_TEAMS | All matching Team summaries | Membership only | Own membership | Own membership | Own membership |
| GET_TEAM_HUB | Basic Team context | Basic Team context | Own Team | Own Team | Own Team |
| LIST_MY_CHAMPION_POOL | No implicit access | No implicit access | No | No | Own entries only |
| LIST_TEAM_CHAMPION_POOLS | No implicit access | No implicit access | Team-visible assessments | Team-visible + own private notes | No |
| GET_PLAYER_COMPETITIVE_DETAIL | No implicit access | No implicit access | Active Player, team-visible | Active Player, visible + own private | No |
| SEARCH_TEAM_ASSIGNABLE_USERS | Yes | No implicit access | Own Team | No | No |
| CREATE_TEAM / UPDATE_TEAM / SET_MANAGER / SET_TEAM_PLAN | `teams.admin` required | No | No implicit access | No | No |
| MANAGE_MEMBER / SET_ROSTER_SLOT | No implicit access | No | Own Team | No | No |
| UPSERT_MY_CHAMPION / DELETE_MY_CHAMPION | No implicit access | No | No | No | Own entries |
| UPSERT_COACH_ASSESSMENT | No implicit access | No | No | Active Player in own Team | No |
| REQUEST_TEAM_LOGO_UPLOAD / COMMIT_TEAM_LOGO / REMOVE_TEAM_LOGO | Only with branding grant | `teams.branding.manage` required | No implicit access | No | No |

Capabilities are separate from membership: a platform administrator is not automatically Manager. A person may independently possess both kinds of authority. No Captain/Owner role is introduced. A nonmember can list an empty personal Team collection but cannot infer private Team/competitive data. Basic Team context includes minimized active membership display/role and roster, not assessments or private profile data.

## Role lifecycle and concurrency

One active role per Team/subject, one Manager and one Coach. Assigning a new Manager/Coach revokes the old role holder atomically. Promotion of a Player clears their roster slots. An active Coach is not silently promoted to Manager, and Manager authority cannot be overwritten by a member-management command. Revoking a member cleans associated roster slots; private data is retained under its explicit visibility rules until a reviewed retention/migration policy applies.

All competitive targets must be active Players in the same Team. A supplied membership ID does not bypass lookup or authorize another subject. Global capabilities are resolved through `authorization.decision.v1`; assignments resolve target accounts through `directory.assignment.v1`. Directory results expose only subject/display name. Synthetic Core is fail-closed on outage; no raw Cognito calls or Creator access context are used.

Strong aggregate/base membership reads establish authority. GSI candidates are revalidated. Reads recheck authority and aggregate/member versions before returning a privacy projection. Commands bind Team version, authorization epoch and caller membership version; applicable target, roster, entry and assessment revisions are also checked. Revocation/epoch races fail without audit/idempotency/domain partial writes. Same-key replay rechecks current authorization. The in-memory test proves these semantics, not distributed Core/database atomicity; persistent adapters remain unimplemented.

## Visibility classes

| Data | Player | Manager | Coach |
|---|---|---|---|
| Player-owned champion fields | Own read/write | Team read | Team read |
| Team-visible assessment (`teamVisible`) | Not returned | Read | Read/write |
| Coach-private note (`privateNote`) | Never | Never implicitly | Authoring active Coach only |
| Migration provenance/raw record attributes | Never | Never | Never |

`CoachAssessment` and `CoachPrivateNote` are separate models, storage keys and schemas. A replacement Coach does not inherit the previous author's private note. Replacing an assessment writes the new author's private note; future history retention is a separate product decision. Every operation, including Player upsert/delete, returns an allowlisted DTO validated against its response schema. Manager DTOs omit the `privateNotes` property entirely; it is not merely hidden by a UI label.

Legacy `coachRecommendation` leakage is an intentional compatibility exception, not parity to preserve. `approval`, `overallFeedback`, `recommendations` and `flexConfirmation` are `DEFERRED_PRODUCT_FEATURES` and have no backend contracts here. Audit records contain actor, operation, Team, correlation ID, version and time only. Private idempotency responses are scoped to their authenticated actor and operation.

See [API schemas and errors](team-hub-v1-api-contract.md), [implementation limits](team-hub-2b1-implementation.md), and [authorization/negative tests](../../scripts/team-hub/tests/domain.test.mjs).
