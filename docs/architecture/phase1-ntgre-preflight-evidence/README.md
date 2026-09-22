# Existing Ntgre preflight evidence ? NO-GO

No deployment, asset upload, change set or AWS mutation. Static live-template comparison identified five unexpected Lambda code-reference changes. The output is a non-executing template diff, not an AWS change set. Recovery and ordering review stopped before completion.

Raw deployed templates and outputs remain in ignored `.amplify/ntgre-preflight/live`. This publishable evidence excludes API-key values and API-key physical identifiers.

- [action-summary.json](action-summary.json)
- [build-context-differences.json](build-context-differences.json)
- [capture-live.mjs](capture-live.mjs)
- [compare-live.mjs](compare-live.mjs)
- [critical-test-ledger.json](critical-test-ledger.json)
- [lambda-code-references.json](lambda-code-references.json)
- [local-comparison-summary.json](local-comparison-summary.json)
- [local-overlay-artifact-diagnostic.json](local-overlay-artifact-diagnostic.json)
- [physical-resources.json](physical-resources.json)
- [protected-resources.json](protected-resources.json)
- [reconstruction.json](reconstruction.json)
- [recovery-readiness.json](recovery-readiness.json)
- [stateful-recovery-template-observations.json](stateful-recovery-template-observations.json)
- [synthesize-ntgre.mjs](synthesize-ntgre.mjs)
- [target-confirmation.json](target-confirmation.json)
- [files.json](files.json): SHA-256 manifest of all evidence except itself.
