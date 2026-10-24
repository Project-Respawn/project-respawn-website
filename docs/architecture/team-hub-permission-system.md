# Team Hub feature permissions

Status: implemented offline, not deployed. This extends the existing independent Team Hub domain. No AWS, permanent IAM, Cognito, authority, frontend publication or business-record changes have been performed. Historical accepted runtime and infrastructure artifacts remain unchanged.

## Dashboard and feature table

The management dashboard places Team Manager above Head Coach. Permissions contains an active-member selector and a feature table generated from `domains/team-hub/structure/feature-permissions.mjs`. Each row identifies its permission, scope and availability. Save waits for a successful backend acknowledgement; failed or unavailable requests never become locally stored permissions. Discard reloads the last acknowledged selection. Untick all is a draft until saved.

| Feature | Candidate permission | Implementation status |
| --- | --- | --- |
| Lineup assignments | `roster.manage` | Server enforcement and checkbox saving implemented offline |
| Player membership management | `members.manage` | Implemented offline; leadership protected |
| Team player pools | `pools.read` | Implemented offline; active targets only |
| Shared review reading | `reviews.read` | Implemented offline; requires pool access |
| Shared review writing | `reviews.write` | Implemented offline; requires both read grants |
| Additional staff appointments | `staff.manage` | Planned, disabled |
| Delegated team settings | `settings.manage` | Planned, disabled |
| Practice/scrim scheduling | `practice.manage` | Proposed roadmap row, disabled |
| Strategies/drafts | `strategy.manage` | Proposed roadmap row, disabled |
| Performance analytics | `analytics.read` | Proposed roadmap row, disabled |
| Personal-pool AI assistance | `development.ai` | Proposed roadmap row; privacy/consent design outstanding, disabled |
| Additional game squads | `games.manage` | Planned, disabled |

Roadmap rows describe proposed functionality, not deployed features or permissions. The backend rejects them as grants. Roles, ownership, private coach notes, plan entitlements and branding are not grantable checkbox values.

## Effective authority

Manager and the existing singleton Coach (Head Coach compatibility) may review and change subordinate grants once the permission feature is explicitly enabled. Global Admin is derived from the existing live Core decision, never from request input. Manager/Coach grant rows cannot be modified through this endpoint. A Head Coach or delegate cannot replace the Head Coach or modify/remove the Manager through membership operations. Manager replacement remains the existing administrator-only operation; owner transfer and additional staff appointments are not implemented by this permission update.

Team-scoped grants require current active membership on every call. Leadership's existing permissions are inherent, not an editable array. Revocation removes grants and roster access while retaining personal pools. Reassigning a member does not resurrect an old grant. Shared-review reading is separate from pool reading; a pool-only delegate gets no assessments. Grants never expose private coach notes. Player-owned editing rights remain the existing baseline and are not controlled by the team-delegation table.

## API and storage

- `GET /v1/teams/{teamId}/permissions`: authenticated leadership/Admin inspection of active member grants and versions. Response advertises `team-hub.permissions.v1`.
- `PUT /v1/teams/{teamId}/permissions/{membershipId}`: closed-schema complete replacement of the target's grant array, including empty-array revocation. Requires expected team version, authorization epoch, actor membership version, target membership version and idempotency key.
- GET team context optionally exposes only the current actor's effective grants for client capability checks. This requires the coordinated updated client contract; old strict clients must not receive the new fields before release compatibility is addressed.
- Optional `permissions` is stored on existing Operational membership rows. The existing transaction writes the membership version, team version/authorization epoch, audit and idempotency, with actual Journal TARGET_WRITER/epoch/version and actor/target concurrency conditions. No new table or database is introduced.
- Both runtimes require explicit `TEAM_HUB_PERMISSIONS=MEMBER_GRANTS_V1` to enable the new behaviour. Without it, v1 business authorization stays unchanged and new permission endpoints return NOT_FOUND. This is a release switch, never an authority bypass: LEGACY_WRITER/FROZEN still deny business routes.

The existing Lambda IAM transaction access is reused in the source design. No IAM expansion has been made. New API routes, exact Lambda invoke permissions and deployment artifact bindings require a reviewed infrastructure/security candidate; do not infer they are covered by prior artifact approvals.

## Validation and deployment boundary

Focused synthetic DynamoDB transport tests exercise real handler/service/repository/codec paths: durable grant readback, immediate grant/revoke enforcement, duplicate/unknown/planned grants, protected leaders, self-escalation, stale versions, a freeze at commit, and shared-review/private-note separation. Existing 41-scenario regression remains unchanged with the feature disabled. Headless browser tests cover feature status, dependencies between checkboxes, one save on double click, leadership protection, conflict reload and unavailable-backend fail-closed behaviour. These are offline tests, not live AWS acceptance.

The current deployed API has not gained these endpoints. Until it does, the dashboard explicitly displays an unsaved draft and disables Save. Legacy production service exports fail closed instead of inventing persistence. Local independent service wiring is ready for the new contract. Existing local-output verification currently requires renewal of AWS inspection credentials; no sandbox configuration was changed to bypass that prerequisite.

Before live enablement: verify the installed Ntgre baseline; prepare exact new runtime/product and artifact-binding candidates; inspect routes, invoke permissions, both code changes and explicit feature-switch environment changes; assess policy-size and resource deltas; review compatibility; separately authorize deployment. Preserve authority, existing data and all protected domains. Verify saved grant readback and role isolation with real authenticated identities after deployment. Public production remains a separate release.

Rollback is state-aware. Old strict codecs reject membership rows containing the new `permissions` attribute, including an empty array. After any grant has been saved, do not roll back to an old runtime that cannot decode it. Prefer rolling back the frontend or disabling the feature with a compatible new runtime; delegated rights then cease to apply. A downgrade to the old codec requires a separately reviewed, backed-up transactional removal of the optional attributes with audit and reconciliation. Never delete memberships or personal pools to make rollback pass.
