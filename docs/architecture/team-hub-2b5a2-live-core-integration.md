# Team Hub 2B5A-2 — accepted dark Core integration

7 October 2026. **ACCEPTED_DARK_CORE_INTEGRATION.** [Migration control](README-PHASE2-MIGRATION.md). Team Hub now uses the [accepted live Core manifest](../../config/domains/core/domain-endpoints.Ntgre.json) in both deployed runtimes. **LEGACY_WRITER / PRE_CUTOVER is preserved; normal Team Hub reads/writes remain denied and frontend cutover is false.**

## Accepted scope and architecture

Owner: Team Hub, shared-contract integration. Existing independent product/security roots in account 058264289478, eu-north-1, Ntgre. Core owns global authorization and bounded directory contracts; Team retains ownership of membership and resource authorization. Existing Cognito, Core, LegacyPlatform, Tournament and production were not deployed or modified. No new root, API, route, database, index, secret, authority record, frontend import or shared-backend schema.

The [dark entry](../../domains/team-hub/core-integration/entry.mjs) bundles the accepted manifest, validates its environment/revisions and invokes Core using each Team runtime's own AWS role. The [handler](../../domains/team-hub/core-integration/handler.mjs) contains no synthetic grants or business repository. Every API Gateway event returns 403 before delegation. The IAM-only direct proof envelope requires a delegated JWT independently verified by Core; decoded claims alone grant nothing. Directory proof additionally requires a fresh teams.admin grant. Manager-specific business integration remains outside this dark acceptance.

## Deployment and security

Both stacks are UPDATE_COMPLETE with rollback enabled. Product **40 → 40**, security **7 → 7**; all physical resource IDs preserved. Net changes from the starting state are the two Team handlers, their runtime policies/boundaries and exact artifact deployment permissions. No additions, deletions, replacements, nested effects or stateful-resource changes. [Preservation](team-hub-core-integration-evidence-2026-10-07/preservation.json).

Product SHA256: `46fd756d8cadb76c519dee8fc11e9db2d7d42cf82b2caed989e2a54ecef57c94`.

Runtime ZIP SHA256: `2992b5d6b736c90c3fc306654a38576cd861dc0e07068c92bf02c79c87948e6a`.

Security SHA256: `febfd6b2210d5417b808fc98c2afcbfb217566a54e1dcc4d886b437f888b4b13`.

Runtime identity and boundary allow only owned logging, the existing AWS-managed Lambda encryption path, and the exact Core function's unqualified/$LATEST ARNs. Named versions, other aliases/functions, direct Cognito access and all DynamoDB/business writes remain denied. [32 actual-role checks](team-hub-core-integration-evidence-2026-10-07/actual-security.json). No synthetic verification lease, authority transition, source fence or target write was enabled.

Historical failures are preserved: the initial security update rolled back at IAM's 6,144-character boundary limit; all original policies and runtime hashes were verified restored before correction. Duplicate region conditions and same-scope deny statements were consolidated without permission expansion. The first live Team-to-Core call then failed with InvokeFunction AccessDenied despite unqualified-ARN simulation allow. Safe transport diagnostics established the actual denial; adding only the same function's $LATEST form to both the allow and explicit-deny exceptions resolved it. Core source/runtime/manifest remained unchanged. [Rollback](team-hub-core-integration-evidence-2026-10-07/rollback-verified.json), [size correction](team-hub-core-integration-evidence-2026-10-07/policy-size-correction.json), [qualifier review](team-hub-core-integration-evidence-2026-10-07/latest-arn-review.json), [AWS ARN matching reference](https://docs.aws.amazon.com/lambda/latest/dg/lambda-api-permissions-ref.html). Failed attempts are retained under attempt-1, attempt-2 and attempt-3; they are not accepted candidates.

## Live proof and observability

**29/29 checks passed** using existing Admin/SuperAdmin and ordinary test accounts through normal Amplify sign-in. Both Command and Read runtimes passed admin authorization, exact self-account resolution, bounded/minimized directory search, ordinary teams.admin denial, ordinary directory denial and tampered-JWT rejection. All **13 deployed normal API routes returned 403** using a real admin JWT. No user/group/password changes were made. [Sanitized receipt](team-hub-core-integration-evidence-2026-10-07/live-proof.json).

Acceptance-window metrics: Command 16 invocations, Read 13, Core 26. Errors **0**, throttles **0**, Core dependency failures **0**; 16 Team proof log records and 26 Core application records; all **10 alarms OK**. No tokens, cursor values, private account values or credentials persisted in evidence. These are bounded-window metrics, not all-time totals. [Observability](team-hub-core-integration-evidence-2026-10-07/observability.json).

100 domain/integration tests, 41 resource-accounting tests, the explicit Team offline infrastructure check and Ntgre local-output validation passed. The historical READ_PROOF synth was tooling validation only; the deployed candidate came from the freshly inspected 40+7 templates. No Legacy synthesis or budget refresh. Ledger still reconciles 2,621 Legacy declarations, with no migration/retirement changes.

## Manifest, rollback and next gate

[Accepted dark integration manifest](../../config/domains/team-hub/core-integration.Ntgre.json), [schema validation](team-hub-core-integration-evidence-2026-10-07/manifest-validation.json), [acceptance decision](team-hub-core-integration-evidence-2026-10-07/acceptance.json). The original Team read-proof endpoint manifest remains historical and unchanged; the new integration manifest explicitly disables consumer cutover.

The unchanged Core manifest's `teamIntegrationDeployed:false` records the state at Core's original acceptance. Current Team integration state is recorded in the new Team-owned manifest and migration status; the Core manifest pin was preserved.

Immediate prior runtime and candidate artifacts are preserved for inspected rollback. Old parity artifact objects remain preserved, but obsolete parity download grants were removed once they were no longer the immediately installed rollback candidate. Returning to the old synthetic implementation would require its matching reviewed security/product pair, not a code-only switch.

Remaining blockers for this dark integration: **NONE**. This does not establish Team business cutover or Manager-specific end-to-end workflows. Next gate: separately reviewed writer-fence, frontend integration and live rollback rehearsal. Current domain: Team Hub. Phase: 2B5A-2 accepted. AWS changes: scoped Team security/product updates and exact artifact objects. Team business writes, Core deployment changes, Legacy changes, Tournament changes, production changes, Cognito mutations and ledger changes: **0**.
