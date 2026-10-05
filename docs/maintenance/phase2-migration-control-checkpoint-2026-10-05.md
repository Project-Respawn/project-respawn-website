# Phase 2 migration control checkpoint — 5 October 2026

[START HERE](../architecture/README-PHASE2-MIGRATION.md) · [Team Hub source checkpoint](../architecture/team-hub-accepted-checkpoint/README.md)

Scope: accepted Team Hub 2B2 source/evidence and reusable migration controls on `phase2/team-hub-extraction`. Previous local baseline: `96b100072f96d03be13e4bb73f5e9518b76a4ebb`. Tournament accepted checkpoint: `98dc1230dfadebbbcc1756823c85c866956ceadc`. This report belongs to the containing checkpoint commit; resolve the exact SHA with `git log -1 -- docs/maintenance/phase2-migration-control-checkpoint-2026-10-05.md`.

## Source and security review

Team Hub accepted product candidate remains `d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f`. All runtime/infrastructure inputs retain their original hashes. One test-only delta updates the obsolete pre-deployment manifest-absence assertion; both versions and hashes are preserved. The accepted endpoint/security evidence matches its receipts. The portable verifier explicitly selects the current five-resource security template and exact-API lockdown, not older four-resource bootstrap templates or diagnostic policies.

The two previously modified tracked files, `amplify.yml` and `scripts/validate-infrastructure-ci.mjs`, are approved explicit-domain selection safeguards and part of the pinned Team Hub source. They are included. No unrelated dirty changes were found. The root README and AGENTS receive only the required migration entry link. No historical evidence is deleted or moved.

`.gitignore` already excludes local environments, credentials, `.aws`, dependencies, `.build`, deployment caches and temporary worktrees; no weakening was needed. `.gitattributes` preserves pinned source/evidence bytes. Intentionally retained snapshots contain non-secret resource identities and test provenance. No credentials, tokens, sessions or passwords are included. The credential-pattern scanner reports paths/rules only, never matched values.

## Validation

| Check | Result |
|---|---|
| Team Hub foundation, read proof, authentication, isolation and domain selection | 268 passed |
| Tournament accepted-state regression and resource accounting | 56 passed |
| Ledger reconciliation and rejection cases | 10 passed |
| Team Hub portable accepted source/manifest/security verifier | PASS; 54 pinned inputs reconciled, including one documented test-only delta |
| Tournament portable accepted-state verifier | PASS; 11 resources, seven accepted security files |
| Team Hub TypeScript `--noEmit` | PASS |
| Website `npm.cmd run build` | PASS; existing chunk-size/plugin timing warnings |
| Current architecture/control documentation links | PASS; 86 local links across 12 entry/current documents |
| Endpoint JSON schema; eight-domain status structure; ledger enums/identity/path checks | PASS |
| Secret-pattern scan | PASS; no matches in prospective files; repeated against the Git index before commit |

Offline foundation tests generated ignored Team-only test assemblies. No AWS calls, Legacy synthesis, Tournament synthesis, deployment or migration occurred. These test assemblies are not accepted deployment candidates and do not replace preserved rollback artifacts.

The root README contains 13 pre-existing broken Bot source-link occurrences. They are outside the new architecture navigation and were left unchanged. Historical documents may retain references to intentionally ignored local artifacts; the inventory preserves those paths and does not claim a repository-wide historical-link repair.

## Current gate

Current domain: Team Hub. Phase: M3 read proof accepted, repository maintenance checkpoint. Next gate: separately authorized 2B3/M4 state inventory and migration preparation. Tournament M7 update/restore proof remains outstanding; Creator work remains paused.

Ledger: all 2,621 declarations reconciled across 62 stacks; 2,430 assigned (92.71%), zero unassigned, 191 unresolved shared, 61 stateful and 62 protected. Zero migrated, retired or retirement candidates. No Legacy reduction is claimed. Full-account and production ownership are not established by this scoped ledger.

AWS changes: none. Live Legacy changes: none. Production changes: none. Ledger changes: initial complete declaration inventory with explicit ownership gaps. GitHub push is to the checkpoint branch only; no merge to main/master/production.
