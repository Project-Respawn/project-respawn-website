# Phase 2 / Phase 2A source-control checkpoint

This checkpoint adds the approved independent-domain architecture and the exact final Tournament Phase 2A source. It records the completed five-resource IAM bootstrap; it does not authorize or perform Tournament Release 1.

Candidate source-manifest revision: `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`. This is a SHA-256 source manifest identity, not a Git commit SHA.

Product template SHA-256: `b9be81faba86a3a8e1949cca1c802720a7bf557cc74cd6cb7f5ee17423c35705`. Product envelope: 11 resources; request-level API access logging remains deferred.

## Authoritative reading order

1. [Phase 2 domain decomposition](phase2-domain-decomposition-plan.md), [stack inventory](phase2-stack-inventory.md), resource/domain and dependency maps.
2. [Final Phase 2A boundary](phase2a-tournament-deployment-boundary-final-2026-09-26.md), which supersedes V1/V2/V3 proposals.
3. [Completed security bootstrap](phase2a-tournament-security-bootstrap-2026-09-27.md). Tournament remains absent. Its execution policy expires at **2026-09-27 23:59 UTC**; future work must refresh authorization and readiness.

Earlier reports and dated AWS observations remain historical evidence, including earlier statements that security resources did not yet exist. Use the completed bootstrap report for the latest state recorded in this checkpoint.

## Source and evidence selection

The 24 source files were copied byte-for-byte from the preserved approved source snapshot and cross-checked against the final isolated worktree. The original candidate worktree and complete local pinned assembly remain unchanged. Twelve final security package files also match their approved byte hashes. `.gitattributes` disables line-ending conversion for these pinned files and retained evidence.

Included: independent Tournament infrastructure, preview handler/client/contracts, isolated dependency lock and tooling, environment/domain configuration, final security definitions, resource/isolation tests, Phase 2 analysis, final validation and IAM simulation evidence, live policy/trust verification, security CloudFormation events, and LegacyPlatform before/after hashes. Account IDs, resource ARNs, public Cognito issuer/client identifiers and policy conditions are intentional non-secret configuration and audit metadata. No credentials or secret values are required.

The final approved template and isolation receipt are intentionally tracked under `phase2a-tournament-boundary-final-evidence-2026-09-26/pinned-build/` as immutable audit artifacts. The source snapshot is intentionally retained to verify the candidate independently of its install location.

Excluded: complete generated CDK assemblies/assets, bundled JavaScript, machine-specific module-load traces, `node_modules`, `.build`, local worktrees and Git metadata, deployment caches, credential/environment files, obsolete security implementation packages, intermediate evidence runners and unrelated Phase 1/application edits. The full preservation manifest retains hashes for the locally preserved artifacts even where those artifacts are intentionally not in Git. Historical report links to omitted intermediate/local evidence are archival references, not instructions to recreate or deploy it. Local analysis runners may depend on that archived evidence; they are not a clean-clone deployment workflow.

## Local verification

From `infrastructure/domains/tournaments`:

```text
npm ci --ignore-scripts --no-audit --no-fund
npm run domain:plan -- tournaments --env Ntgre
npm test
```

From repository root:

```text
node --test scripts/cloudformation-accounting.test.mjs
node scripts/verify-phase2-checkpoint.mjs
node scripts/verify-phase2-checkpoint.mjs --staged
```

The plan builds/typechecks/synthesizes only locally in the checkpoint worktree. It does not replace the original preserved deployment assembly. The deployment command remains review-only and rejects execution flags.

Checkpoint validation on 27 September: TypeScript and isolated local synthesis passed, reproducing the approved source revision and 11-resource template. Tournament contract/security/isolation tests: **26/26 PASS**. Resource-accounting tests: **24/24 PASS**. Exact candidate/security hash verification passed. Credential/token/private-key and sensitive JSON-field scans found no secrets in the selected additions. `.gitignore` excludes credential directories, local environment files, private-key files, worktrees and build/deployment caches. Windows checkouts under long parent paths may require Git's `core.longpaths=true`; this is a local Git setting, not a committed machine configuration.

Git destination: `phase2/architecture-tournament-checkpoint`, based on development commit `9cacb3bdc53ad2511ef1c8baa6dd1f4dfa71a633`. No production/main merge. Read-only Amplify checks confirmed automatic branch creation disabled and only `master`, `staging`, and `Demo` connected; this checkpoint branch is not connected to deployment.
