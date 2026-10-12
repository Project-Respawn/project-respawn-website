# Reusable migration checks

Use with the [migration entrypoint](README-PHASE2-MIGRATION.md), [gate worksheet](domain-migration-template.md) and [deployment acceptance standard](project-respawn-aws-deployment-acceptance-standard.md). These utilities make no AWS calls and grant no execution authority.

| Check | Shared implementation / required inputs | Limit |
| --- | --- | --- |
| Immutable artifacts | deployment-checks.mjs verifyArtifacts: explicit path/SHA-256 list, duplicate rejection | Hashes establish bytes, not approval or secret safety |
| Lambda ARN coverage | lambdaResourceForms: exact unqualified ARN and :$LATEST | Returns test inputs, not IAM grants; service evaluation still needs evidence |
| Environment recovery | verifyEnvironmentRecovery: before/after/desired, submitted revision, IAM hashes, drift | Requires complete map, preserved non-environment properties/code/role and Active/Successful; UNKNOWN rejected |
| IAM lifecycle/KMS coverage | verifyCoverage: requirements, action/resource/context cases, expected decisions and complete/critical receipts | Exact installed equivalence required; explicit deny cannot be substituted with implicit deny; live service authorization separate |
| Throttling | iam-validation.mjs exports accepted deterministic scheduler, planner and result flattening | Consumer supplies approved read-only adapter; no automatic AWS access; 15s spacing, bounded throttling retries |
| Acceptance/isolation/cleanup | verifyDeploymentAcceptance: exact expected/actual resource and route records, protected snapshots, monitoring/business-state/cleanup receipts | Reject duplicates/extra/missing records; caller must establish provenance and truth of live evidence |
| Resource accounting | existing scripts/cloudformation-accounting.mjs and resource-accounting tests | Recursive domain budget and expected differences remain domain-owned |
| Legacy ledger | scripts/migration/ledger.mjs check | Reconciles repository evidence; does not refresh AWS |
| Documentation | scripts/migration/document-links.mjs | Local Markdown/reference link targets; no fragment or external network certification; archived origins hash-verified |

Implementations: [deterministic checks](../../scripts/migration/deployment-checks.mjs), [IAM scheduler adapter](../../scripts/migration/iam-validation.mjs). The scheduler is reused from its accepted Team Hub location to preserve sealed historical hashes. Future domains import the shared entrypoint; do not copy Team Hub's whole executors, physical IDs, time windows or fixed authority expectations. Existing pinned deployment scripts were not refactored.

Offline validation:

```text
node --test scripts/migration/*.test.mjs scripts/team-hub-iam-validation/harness.test.mjs
node scripts/migration/ledger.mjs check
node scripts/migration/document-links.mjs
npm run test:resource-accounting
```

For a Git-free checkpoint export use document-links.mjs --filesystem; empty file selection fails closed. Historical local-only references are explicitly enumerated in the retention register and counted separately from working portable targets. This does not exempt current accepted artifact pins or silently skip unknown missing links.

For IAM coverage, each case supplies id, requirements, action, resource, context and expected decision (allowed, explicitDeny or implicitDeny). Every mandatory requirement maps to at least one complete certification case; installedRequired requirements also map to actual-role checks. Set complete only after all expected results exist. Review both positive and negative requirements, key/service/account/context, principal/trust, PassRole, cross-domain and cleanup lifecycle. A Boolean installedEquivalent must come from real exact readback, not a fixture in a live acceptance report.

Tests use synthetic evidence to prove failure detection and scheduler behavior; they do not claim new live AWS acceptance. Generic hosted CI enforcement, full import-graph/ownership enforcement and automatic trust-policy verification across all domains remain future scoped work. The Team Hub reference supplies accepted examples, not unrestricted reusable AWS commands.
