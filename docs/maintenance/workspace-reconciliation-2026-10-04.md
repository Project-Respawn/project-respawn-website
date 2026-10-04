# Original workspace reconciliation — 4 October 2026

The original VS Code workspace contained **720 Git changes**, not 720 edits to application code: two modified tracked architecture documents and 718 untracked files. Directory-collapsed `git status` understated the untracked file count. The original branch was `development`, HEAD `5048a7fd0f8310b2615e7ae346707abee9fe7805`, tracking `origin/development`. There were no tracked deletions, staged changes or tracked gitlinks.

## Preservation

All 720 original files were copied into the ignored local directory `.local-backups/workspace-reconciliation-20261004/files/` and checked with SHA-256. The inventory and verification records are beside that directory. No ignored credentials, sessions, dependency directories or unrelated worktrees were added to the checkpoint.

The separate local branch `checkpoint/pre-phase2-domain-extraction`, commit `6b8b3085f7acd418ffe5617c98bd0dd632447d59`, preserves the entire original change set. It is deliberately **not pushed**: it contains historical deployment diagnostics, recovery policies and raw evidence that have not been selected for publication or future execution. Git can normalize text line endings; the local backup retains exact original bytes.

The [complete file inventory](workspace-reconciliation-inventory-2026-10-04.json) records all 720 paths, classifications, original hashes and dispositions:

| Classification | Files |
|---|---:|
| Already in accepted Tournament checkpoint | 121 |
| Unique source/planning work | 118 |
| Historical/temporary evidence | 454 |
| Generated artifacts | 27 |
| Caches/dependencies, worktree artifacts, obsolete duplicates, unknown | 0 in the 720-file change set |

The source/planning category includes 112 historical deployment/security/diagnostic files and six useful current files. Historical evidence is preserved, not classified as disposable merely because it is dated. Existing ignored caches and dependencies are outside these counts and remain local.

## Working baseline

`phase2/team-hub-extraction` starts with development's existing application fixes and merges accepted Tournament checkpoint `98dc1230dfadebbbcc1756823c85c866956ceadc`. The only merge conflict was `.gitattributes`; the resolution retains the Phase 1 byte-preservation rules and adds the accepted Release 1 policy/evidence rules. No application source or package lock was overwritten.

Six unique files are retained in the active baseline:

- `docs/tournaments/founders-cup-implementation-plan.md`: product implementation planning.
- `docs/tournaments/founders-cup-rules-config.md`: tournament rules/configuration planning.
- `docs/tournaments/tournament-api-contract.md`: proposed product API contract.
- `docs/tournaments/tournament-domain-model.md`: proposed product model.
- `docs/local-role-test-accounts.md`: existing Ntgre role-testing instructions.
- `scripts/ntgre-role-test-accounts.mjs`: guarded local role-account utility, with interactive/stdin password input and no stored password. This AWS-writing utility was inspected, not executed.

These product plans are design documents, not an assertion that Release 2 or their APIs are implemented. Historical recovery scripts remain recoverable on the preservation branch; they are not mixed into the pinned Tournament source set. The accepted runtime v2 / execution v8 package remains authoritative.

No original work was discarded. Git branch switching removed archived files from active paths after they were committed and backed up. No bulk filesystem deletion, `reset --hard`, `git clean`, credential change or cache purge was performed. `.gitignore` now additionally covers root-level coverage, test-result and Playwright reports; deliberately tracked architecture evidence remains tracked.

## Worktrees and VS Code

Seven existing secondary worktrees are retained: the clean accepted checkpoint; the clean master-fulfillment fix (not proven obsolete); four dirty historical Tournament worktrees; and the dirty shared-handler candidate. Their changes are separate repositories in VS Code and must not be discarded. No worktree directory was removed.

The registered `project-respawn-clean-release` worktree pointed to a directory that no longer existed. Its stale registration was pruned; Git reported permission denied removing the remaining metadata directory, but it no longer appears in `git worktree list`. Its branch and commit remain preserved. No force deletion was attempted.

After committing this reconciliation, the original workspace should show zero changes. Refresh/reload Source Control if its count is stale. If VS Code explicitly opens secondary repositories, their preserved changes can still appear under those repositories; this task does not promise to clear their independent changes.

## Validation and boundaries

- Tournament proof/authentication/isolation tests: 26 passed.
- Accepted configuration/security regressions: 15 passed.
- Resource accounting: 41 passed.
- Tournament and Amplify TypeScript: passed.
- Website production build: passed, with existing missing CSS and large-chunk warnings.
- Exact accepted Tournament source/security check and endpoint/environment schemas: passed.

The original workspace initially lacked its ignored test receipt. Eighteen already-verified ignored build artifacts were copied from the accepted checkpoint worktree without overwriting existing artifacts; the Tournament suite then passed. No fresh synthesis was performed and no candidate was substituted for deployment.

The original `src/`, `amplify/`, `tests/`, `package.json` and `package-lock.json` remain equal to development. All original changed files are preserved in the local branch (content checked allowing Git line-ending normalization) and exact-byte backups. Existing local environment/output files remain unchanged. Credential-pattern scanning found no credentials or tokens in the preservation set.

No push, production merge, AWS call, deployment, rollback, Release 2 implementation or Team Hub extraction occurred. The new branch is prepared for separately scoped Team Hub work only.
