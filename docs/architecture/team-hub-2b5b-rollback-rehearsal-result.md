# Team Hub 2B5B rollback rehearsal result

7 October 2026. **ISOLATED REHEARSAL PASS; ACTUAL BUSINESS AUTHORITY UNCHANGED.**

[Final receipt](team-hub-2b5b-evidence-2026-10-07/rehearsal.json) binds runtime ZIP SHA-256 `cc32b3eadc5f9f1613478b1fe5a657dda6513ec0bf847333ea33991d009ec319`. The handler ran locally with synthetic Core transport and real DynamoDB transactions against six exact disposable Ntgre rehearsal tables. This was not a deployment of the candidate or an installed runtime-IAM proof.

Nine mutations created representative state: Team creation, Manager/Coach/Player membership, Team update, Pro plan, roster, Player champion and team-visible Coach assessment. Nine native operational rows and 19 journal rows were accounted for. No raw identity, token, private note or customer payload is retained in the receipt.

The transport froze isolated authority immediately before an update transaction committed. DynamoDB rejected its authority ConditionCheck. Operational contents and journal row count stayed unchanged. A subsequent request also denied while FROZEN. This covers both an in-flight transaction and a request arriving after the freeze.

Reverse transformation produced Team 1, TeamMembership 3, TeamRosterSlot 2 and PlayerChampionPoolEntry 1 in four isolated Legacy-compatible restore tables. Native/state canonical digests, mapped settings and reconciliation passed. Native versions, authority metadata, audit and idempotency remain archived separately because the Legacy schema is not a lossless representation of all native control state.

All six tables were deleted using their recorded identities. A separate one-table resource-policy rehearsal also completed cleanup. [Final preservation](team-hub-2b5b-evidence-2026-10-07/preservation.json) confirms all seven temporary names absent, actual source counts zero, actual Operational zero, Journal containing only the existing 15 synthetic audit records, no actual authority row, and unchanged live Core/Team templates and Team runtime/environment.

The earlier rehearsal receipt is retained as [initial evidence](team-hub-2b5b-evidence-2026-10-07/rehearsal-initial.json); the final receipt supersedes it by adding the atomic freeze race. Across both six-table runs plus the policy fixture, 13 temporary table creations were performed, all removed. Peak concurrent temporary resource count was six. No actual source restore, real target business write, frontend cutover or Legacy retirement occurred.

Future rollback after real writes must freeze the target first, drain in-flight writers, capture all native/control/journal state, reverse-transform and validate against actual data, restore under separately approved recovery authority, reconcile completely, then re-enable exactly one writer. This rehearsal does not authorize those operations.
