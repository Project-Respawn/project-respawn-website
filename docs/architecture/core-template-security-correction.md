# PROJECT RESPAWN CORE — TEMPLATE ARTIFACT SECURITY CORRECTION GATE

6 October 2026. **CORE TEMPLATE SECURITY CORRECTION READY FOR DEPLOYMENT REVIEW.** Preparation only; Core is not deployed and execution is not authorized by this review.

## Product

Revision: preserved Ntgre quota-corrected product. Template SHA256: `4aad4b8df1b1272f12e93144b3a1e89a2addaab5e404950f924ff7d7b58b9e46`. Runtime ZIP SHA256: `4841f475dab09982d8ff5babc240c8a7d8809d05911de8e239ac9031e6fcefcf`. Product resources: 8; security resources: 5. ReservedConcurrentExecutions absent. Runtime bytes, contracts and runtime IAM unchanged; no runtime rebuild. [Candidate](core-artifact-evidence-2026-10-06/candidate.json), [preservation tests](core-artifact-evidence-2026-10-06/validation-correction.txt).

## Artifacts and rollback

Bucket: `cdk-hnb659fds-assets-058264289478-eu-north-1`.

- Previous template: `core/2b5a/89c712720e1fc09b9546865bd36b12a0123c8560ed8334d282918ac7cedbbaeb/product.template.json`.
- New template: `core/2b5a/4aad4b8df1b1272f12e93144b3a1e89a2addaab5e404950f924ff7d7b58b9e46/product.template.json`.
- Runtime ZIP: `core/2b5a/4841f475dab09982d8ff5babc240c8a7d8809d05911de8e239ac9031e6fcefcf/runtime.zip`.

Both caller and execution identity/boundary evaluations allow each exact new template and ZIP. Random object, other hash, old template, Legacy, Team Hub, Tournament and production objects deny; ListBucket denies. No bucket/prefix-wide read granted. No security-template S3 object required: the reviewed bootstrap supplies local TemplateBody. [Individual IAM results](core-artifact-evidence-2026-10-06/security-review.json).

Old template retained locally for audit, but old deployment-role read permission removed. The old product was never deployed and its reservation is unusable at the existing quota. There is no previous accepted Core release to roll back to; first-create recovery uses CloudFormation rollback, with retained resources inspected before retry. [Exact six-reference diff and decision](core-artifact-evidence-2026-10-06/semantic-diff.json), [reference inventory](core-artifact-evidence-2026-10-06/reference-inventory.json).

Nothing published. [Publication manifest](core-artifact-evidence-2026-10-06/publication-manifest.json) fixes byte lengths, SHA256, base64 checksums and AES256/SSE-S3 for both objects. Actual S3 encryption/checksum verification must follow separately authorized publication; it is not claimed here. No KMS decrypt grant added. Historical Release 1 publication helpers still select old inputs and must not be used as current deployment authority.

## Security diff

Previous security candidate/template SHA256: `6b2afefb79172922e4338128a6b5fdab5e561e4055f8960650798acd4c4e8515`.

New security candidate/template SHA256: `232c577cf84eb151dccaee88e702174a0225972fec87a3d432a2dc7f631acf79`.

Exactly six statement references changed: two caller TemplateUrl conditions and four caller/execution S3 object ARNs (identity and boundary). Reversing those strings reproduces the original security document semantically. Runtime boundary, Cognito read/mutation rules, logging, PassRole, stack scope, other-domain denials, business KMS, IAM administration, trust and CloudFormation service scope are unchanged.

## Validation

Positive IAM: 16/16. Negative IAM: 59/59. Every requested action/resource result retained individually. Access Analyzer: five policy documents plus three trusts; zero findings, errors, warnings or invalid actions. [Trust results](core-artifact-evidence-2026-10-06/trust-review.json). Local correction tests 4/4; runtime/contract/failure regression 35/35; migration ledger validation PASS. [Local results](core-artifact-evidence-2026-10-06/validation.json).

Logging discrepancy remains **SIMULATOR_UNSUPPORTED**; existing [unconditional controls](core-release1-evidence-2026-10-06/logging-controls.json) and [classification](core-release1-evidence-2026-10-06/logging-classification.json) remain accepted. No logging policy changes or reopening. IAM mutation checks cover IAM-authorized Cognito operations; they do not claim to govern APIs authorized directly by end-user access tokens. No Core live runtime acceptance claimed.

Unresolved for this correction: none. Subsequent deployment review must authorize exact artifacts/security, refresh gates, review AWS-generated changes and prove live runtime acceptance before Team integration.

## Quota and protected domains

Account concurrency 10; unreserved 10; Core reserved NONE. Quota blocker resolved without quota changes. [Read-only quota](core-artifact-evidence-2026-10-06/quota.json).

Legacy 2,621 / FunctionDirectiveStack 167, templates and physical IDs preserved. Team Hub 40 product +7 security, API t54b88casf, LEGACY_WRITER, verification DISABLED. Tournament 11, API msipnwy39j. Production not targeted. Core resources absent. [Baseline](core-artifact-evidence-2026-10-06/baseline.json), [Team preservation](core-artifact-evidence-2026-10-06/preservation.json), [absence](core-artifact-evidence-2026-10-06/absence.json).

AWS account 058264289478, region eu-north-1, operator arn:aws:iam::058264289478:user/RavenTest. AWS changes made: **0**. No publication, security installation, change-set creation/execution, quota update or deployment.
