# Phase 1 evidence

See the [A–J review](../phase1-implementation.md). These are local/read-only preparation results, not deployed state or an executed AWS change set. All evidence files and SHA256 receipts are enumerated in [files.json](files.json).

## Exact comparison

- [summary.json](summary.json): both complete root inventories and count/type/module/template deltas; 0 additions, 81 updates, 308 deletions, 1,238 checks without failures.
- [changes.json](changes.json): every changed logical ID, resource type, action, property and before/after value.
- [checks.json](checks.json): protected-resource, envelope, scope, resolver/auth/VTL and Lambda asset assertions.
- [resolvers.json](resolvers.json): all 79 field/auth/invocation mappings, including both Team Hub gateways.
- [lambda-assets.json](lambda-assets.json): all 12 Lambda resources and 35 file hashes across ten unique code assets.
- [source-preservation.json](source-preservation.json): initial-working-tree comparison, inverse alias proof, unchanged frontend/outputs and lockfile version/integrity checks.
- [test-comparison.json](test-comparison.json): exact matching failures and final case-sensitive Linux suite totals.
- [candidate-resource-report.json](candidate-resource-report.json): strict create assessment, intentionally blocked at 2,628.
- [candidate-update-gate.json](candidate-update-gate.json): bounded existing-debt accounting, explicitly not deployment approval.

## Validation logs

`baseline/` and `candidate/` preserve command ledgers and output. `full-suite.txt` is the original exact-Windows-byte/harness run; `full-suite-linux-lf.txt` is the final LF, case-sensitive run with neutral branch environment. Both are kept to make the three harness/line-ending failures transparent. The final suite has the same seven existing failures in both copies. `master-preview-after-synth.txt` resolves the earlier missing-template prerequisite without changing its test.

The first TypeScript run lacked clean-checkout generated Amplify environment declarations. `typescript-after-synthesis.txt` records the passing rerun. Baseline's later rerun was an explicit separate command; its initial ledger is intentionally preserved rather than rewritten to hide the first failure.

`baseline-npm-ci.txt` records the original inconsistent lock failure. `repaired-npm-ci.txt` and `candidate-npm-ci.txt` record independent successful installations of the verified same lock repair. The original lock was not separately installed in a second candidate run; the report does not claim it was. `local-outputs.txt` is the host's read-only check of current Ntgre.

Production builds use process-only output-matching API URL, sandbox payment mode and a nonfunctional public-key placeholder. They validate compilation, not checkout/payment behavior. No secrets, user rows or live provider interactions were needed.

Templates/assets were synthesized in Linux containers without AWS credentials, exported to local `.amplify/phase1` archives and compared with the repository comparison script. Assemblies/source snapshots and the old failed-install container are local reproducibility artifacts; they are not published here as deployable packages. The rich resource diff contains public infrastructure identifiers/expressions, not secret values. No current environment outputs were replaced.

The original overall architecture audit evidence remains under `../evidence/`; it describes the earlier live snapshot, not a deployed consolidation.
