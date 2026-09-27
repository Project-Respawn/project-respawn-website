# Ntgre artifact/preflight evidence — 2026-09-22

Read with [the final A–J report](../phase1-ntgre-preflight.md). Final decision: **NO-GO because the existing resource-debt allowance excludes Ntgre**. The prior Lambda discrepancy is resolved by exact whole-ZIP reproduction.

Evidence groups:

- `deployed-packages.json`, `deployed-package-inventory.json`, `complete-zip-comparison.json`: actual Lambda package identity and byte equality. Download URLs and package contents are not committed.
- `initial-artifact-diagnosis.json`, `windows-package-comparison.json`: original map-only differences and naturally reproduced Windows source maps.
- `live-to-baseline.json`, `live-to-candidate.json`: exhaustive resource diffs; API-key physical identifiers are redacted. No template or metadata difference is ignored.
- `local-comparison-*.json`: unchanged comparator's results, including all checks and Lambda hashes.
- `dependency-protected-analysis.json`: 77 chain transitions, 175 protected records, 735 successful checks. Full dependency adjacency maps remain under ignored `.amplify/ntgre-artifact-investigation`; their digest is recorded separately.
- `recovery-readiness.json`, `secret-recovery-dependencies.json`: actual read-only findings, including every resource and configured SSM dependency. No secret values.
- `accounting-gate.json`: unchanged evaluator result, exact Ntgre counts and pinned-exception scope failure.
- `candidate-integrity.json`, `toolchain-versions.json`, `windows-workspaces.json`, `*-npm-ci.log`, `*-synthesis.log`, `validation-*`: exact source identity, environment and fresh validation evidence.
- `previous-preflight-report.md`: prior unresolved-artifact NO-GO retained for audit, not the current decision.

The `.mjs` files are archived investigation tools from `.amplify/ntgre-artifact-investigation`, with their original relative imports/working-directory assumptions. They are not application changes and should not be run in place from this evidence directory. The synthesis helper is deliberately copied into `.amplify/synthesize-ntgre-live-context.mjs` in an isolated manifest-verified project so its dependencies resolve from that project's independent install.

For a new reproduction, first materialize the candidate with the existing exact-byte snapshot workflow and recorded candidate manifest. Materialize a separate baseline using the preserved baseline schema override. Use Windows Node 24.14.1, npm 11.11.0 and the unchanged lockfile. In each root run `npm.cmd ci`, create `.amplify/ntgre-preview`, copy the corrected helper as described above, and run `node .amplify/synthesize-ntgre-live-context.mjs candidate` or `baseline`. The helper refuses an existing output directory and performs synthesis only. The package helper invokes CDK's local ZIP utility only. No downloaded live package is used as build input.

Private raw investigation data is under `.amplify/ntgre-artifact-investigation`; prior AWS templates are under `.amplify/ntgre-preflight/live`. Actual deployed ZIPs and extracted code stay in ignored local storage. Isolated source installations are in the paths recorded by `windows-workspaces.json`. Full root responses containing API-key outputs were excluded from this directory.

`evidence-manifest.json` pins all evidence files except itself, plus the final report hash. No deployment, change set, asset upload, protection change, secret read, Cognito change, DNS operation or sandbox watcher was performed.
