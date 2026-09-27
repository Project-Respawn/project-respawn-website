# Tests and audit evidence

Keep reusable tests beside the code they protect. Passing a test is a reason to retain its regression coverage, not to delete the test. Keep synthetic fixtures, test helpers and isolated package lockfiles. Never commit real passwords, tokens, private keys or temporary AWS credentials.

## What this cleanup retains

The 27 September review covers all 132 original Source Control entries: 131 regular files and one dirty tracked worktree entry. Of the regular files, 104 contain reusable source, tests or portable audit evidence; 27 are one-off runners, raw validation logs or machine-specific execution records retained locally and explicitly ignored. The [file inventory](repository-cleanup-inventory-2026-09-27.json) records every original file and its decision. A second tracked worktree entry was also found during the tracked-file audit. Both Git entries were removed without deleting either local directory.

All 130 previously tracked test files are retained. They cover authorization, application behavior, resource budgets, deployment isolation and local synthesis. One is an intentional byte-identical source snapshot of the approved Tournament candidate. Tests were not removed to conceal failures. The SWG route test was updated to parse route records instead of depending on line wrapping, and now covers valid launcher redirects and rejection of appended parameters.

The source checkpoint includes the existing TTS delivery/queue fixes, Team Hub loading guards, SWG launcher return-link handling and Buff Builder layout changes. The Twitch task flag is source for a future coordinated rollout; neither its production nor staging stack is deployed by this cleanup. The bot/native-service counterparts remain in their separate repositories and are not claimed to be released here.

## Local test commands

```text
npm run test:resource-accounting
npm run test:overlays
node --test scripts/team-hub-coach-render.test.mjs scripts/team-hub-output-contract.test.mjs scripts/swg-eof-access.test.mjs
node node_modules/tsx/dist/cli.mjs --tsconfig amplify/tsconfig.json --test amplify/myFunction/twitch/*.test.ts amplify/overlaySource/*.test.ts infrastructure/twitch-runtime/*.test.ts
node node_modules/typescript/bin/tsc --noEmit -p amplify/tsconfig.json
npm run build
```

The Twitch handler tests need the Amplify TypeScript path mapping; running tsx without that configuration cannot resolve `$amplify/env/...`. Their injected storage/transport dependencies perform no deployment.

These two integration suites inspect a locally synthesized MASTER-context template. Generate that ignored template first; do not commit the assembly or replace it with the Tournament candidate:

```text
npm run synth:master-backend
npm run test:master-backend-preview
npm run test:runtime-ownership
npm run validate:infrastructure-ci
```

Synthesis is local preparation, not deployment authorization. Manual scripts such as `create-test-users.ps1`, `test-application-storage-sandbox.mjs` and `test-public-application-sandbox.mjs` are opt-in live integration tools, not disposable test outputs. They can write AWS/application state and were not run during cleanup; existing target-specific authorization rules still apply.

## Audit artifacts and pinned candidates

Keep final architecture/deployment reports, manifests, policy definitions, reconciliation results and resource/hash evidence that explains what was reviewed and deployed. Dates in historical reports describe those runs; they are not fresh authorization or a promise that an expired allowance is usable. Phase 1 allowance code remains an offline guard with explicit expiry and exact-artifact requirements, not a deployment command.

Raw one-off logs/runners and local machine paths remain in ignored local archives. Historical manifests may reference those omitted local files; their original hashes are retained as provenance. Absolute operator paths in four newly checked-in reports were replaced with portable descriptions. Original copies remain in the local backup. Retained Phase 1 JSON evidence preserves its original bytes through Git attributes.

The historical discrepancy Markdown report also had an extra trailing blank line removed. Historical manifest hashes for original reports refer to the preserved originals; report formatting changes are not a new deployment candidate or a repinning of any assembly.

The complete approved Tournament assembly and source snapshot remain preserved. Candidate revision `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f` is unchanged. The intentionally tracked final template/receipt and source snapshot are audit evidence; other generated assembly contents stay ignored. No candidate files were regenerated or substituted for deployment.

Backups are under `.local-backups/repository-cleanup-20260927/`; they are local-only and are not uploaded. The earlier synchronization backup is also retained. Neither secrets nor unreviewed generated files should be added just to make Source Control empty.

## Cleanup validation — 27 September 2026

- JavaScript/frontend/guard and local-template tests: **404 passed, 0 failed, 0 skipped**.
- Affected Twitch, overlay and infrastructure TypeScript tests: **77 passed, 0 failed, 0 skipped**.
- Amplify TypeScript check and website production build: **passed**. The build still reports its existing large-chunk advisory.
- Protected Ntgre outputs: **verified read-only**. Schema contract: 24 queries, 55 mutations, zero subscriptions; frontend contract: 62 operations, zero missing.
- Local infrastructure CI accounting: **passed with existing debt**, MASTER-context hierarchy 2628 to 2628, largest template 167 to 167, all module deltas zero. This source baseline is distinct from the deployed Ntgre inventory of 2621. No budget/debt baseline was refreshed and fresh creation remains blocked above 2500.
- Exact Tournament source/security verification against the Git index: **passed**, 24 source files, 12 security files, unchanged approved revision/template.
- Staged credential/token/private-key, sensitive JSON-field and machine-path scan: **no findings**. Account IDs, public endpoints, pool/client IDs, role ARNs and secret *names* in policies are non-secret provenance/configuration, not credentials.
- No AWS deployment, application-data mutation, staging/master push or production change occurred. Existing application fixes are checkpointed for later separately authorized rollout.
