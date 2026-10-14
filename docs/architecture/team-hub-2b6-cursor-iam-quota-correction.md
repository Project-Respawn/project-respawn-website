# Project Respawn Team Hub 2B6 — cursor IAM quota correction

**CURSOR IAM QUOTA CORRECTION READY FOR DEPLOYMENT REVIEW**

Offline security preparation only. No AWS resource writes, artifact uploads, change sets, deployment, authority transition or frontend activation occurred. Read-only IAM inspection and security-validation API calls were used. Historical candidates and evidence remain intact.

## Exact pins and policy sizes

| Item | Original intended | Optimized | Limit |
| --- | ---: | ---: | ---: |
| Execution role, aggregate inline JSON | 10,394 | 10,166 | 10,240 |
| Execution permissions boundary | 6,273 | 5,992 | 6,144 |

Counts use compact resolved policy JSON with whitespace excluded. All execution inline policies are included; the fresh installed role has one inline policy. Neither policy uses unresolved CloudFormation intrinsics. The other managed policies also remain below their limits. [AWS IAM quotas](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html) define the managed-policy and aggregate inline-role limits; splitting inline policies alone would not solve an aggregate-role overflow.

| Artifact | SHA-256 |
| --- | --- |
| Immutable quota-correction candidate | `3f06894002c424ba2bd569b5df2250860f584679cd800497c4274a9280b20d48` |
| New optimized security template | `5cf68f36b3e4e3f95ba8a3cb1444eacc82e382ae214e0cee58d5382409974c23` |
| Product template — unchanged | `caa0a68384990438196ed7720f1a24062641e03220f6092c1b4a2340d2417241` |
| Read ZIP — unchanged | `ab6edf023d4091f87c56de7f4d5520cda580630d5e147e9c49c0a09a135c571e` |
| Installed/unchanged Command ZIP | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |
| Preserved oversized intended security | `3dee5dad57dd229e7d7bf9f6a7024722c88061f646ee5c71b2bd368ef5f7a9d4` |

[Candidate reference](team-hub-cursor-iam-quota-evidence-2026-10-13/candidate-reference.json) identifies the content-addressed candidate and security template. The security template is 32,595 bytes, allowing the reviewed security-owner path to use its pinned TemplateBody. Product deployment must continue using the exact allowed TemplateURL.

## Cause and exact representation changes

The new exact Read ZIP ARN was added to the execution identity's S3 Allow and S3 NotResource denial, and to the boundary's existing resource list. These additions caused the execution-policy overflows. The exact new product and current-template rollback URLs/object ARNs were added to PreparationCaller; that policy was already within quota. All five execution ZIP references and all four caller template references survive unchanged in the optimized intended candidate.

Only these representations change relative to the full intended oversized template:

1. Remove three execution-identity Sid labels. Labels do not participate in authorization; the receipt maps their original names and indices.
2. Merge unconditional execution-identity Deny statements having identical Resource `*` and no conditions by taking the union of their actions.
3. Merge the two unconditional execution-identity Allow statements for Resource `*` (DescribeLogGroups and GetRandomPassword), preserving exactly their existing action union.
4. Remove the duplicate boundary denial of PassRole outside the same three runtime roles. The identical **explicit denial remains in the identity policy**. The boundary's exact three-role, Lambda-service-only PassRole Allow remains byte-equivalent; it has no other PassRole Allow.

No action, ARN, prefix, wildcard, condition, trust grant or artifact is added by optimization. No KMS, runtime, Cognito, stack, API or other-domain permission changes. PreparationCaller, Read/Command boundaries and every nonexecution resource are identical to the full intended template. The security candidate still contains only seven existing resources.

For foreign PassRole targets, the complete identity-plus-boundary result remains **explicitDeny**. Evaluating the boundary alone changes that redundant result from explicitDeny to implicitDeny; it still does not authorize foreign PassRole, even when a hypothetical unrestricted identity Allow is supplied. This distinction is recorded rather than described as identical boundary bytes or identical standalone denial categories.

## Security-equivalence proof

Identity statements expand into identical authorization atoms after labels and action grouping are normalized. This proves equivalence for every action/resource/context represented by those predicates, rather than only sampled requests. The only removed boundary predicate is an identical retained identity denial: when it matches, the retained identity denial decides the request; when it does not match, removing it has no effect. Explicit denial overrides any other Allow under [AWS policy evaluation rules](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html).

Fresh installed inspection confirms account 058264289478 and RavenTest, execution/caller trust, inline policies, attached policies and boundary versions match the accepted deployed baseline. The caller correctly uses its existing managed policy and boundary, not an invented inline policy. Runtime IAM is not changed by this candidate.

Evidence in `team-hub-cursor-iam-quota-evidence-2026-10-13`:

- `security.json`: 222 action/resource comparison and wrong-runtime-principal control rows, including exact current/rollback ZIPs, wrong artifacts, Lambda lifecycle, other domains, both KMS keys/unknown keys, secret context/service, KMS/IAM administration, wrong-region and deployment/business separation. Six groups also inject a hypothetical extra identity Allow; all original and optimized effective decisions match. Read/Command actual principals remain denied deployment-asset access, code update and PassRole.
- `positive-coverage.json`: all 13 original Allow statements exercised in 240 action/resource pairs; 228 effective positive results preserved and 12 already-denied API-tag PATCH/DELETE combinations remain denied. These existing denials are not converted into successes or treated as new grants. Two additional standalone-boundary overgrant controls prove foreign PassRole is still denied. Wildcard API actions use representative supported HTTP action names; structural predicate equivalence covers the unchanged wildcard itself.
- `caller-and-lifecycle.json`: 19 exact template/object, wrong URL/execution role/region, foreign-stack and caller PassRole controls. Twenty checks cover installed, identity-first, boundary-first and final combinations: the same three PassRole targets remain allowed and foreign targets remain explicitly denied throughout installation and security rollback.
- Access Analyzer: three identity-policy validations, **zero findings**, including no policy-size warning.

Total: **503 IAM comparison/control rows**. ResourceSpecificResults are expanded and checked against every requested action/resource pair. Grouped aggregate decisions are not accepted as substitutes for individual results. Truncation, missing and duplicate results block certification. Requests are rate-limited; the full comparison suite has bounded read-only throttling retries and required zero retries.

Earlier incomplete inspector/batch/aggregate receipts are retained as diagnostics and are superseded by the complete per-resource evidence. A corrected inspector handles the caller's absent inline Policies property; mixed `*`/exact resource requests are split as the IAM API requires. No policy changed to accommodate these harness corrections.

These are structural and IAM simulator proofs. They do not prove a future CloudFormation lifecycle will succeed or replace live installed-policy, Lambda and authenticated API acceptance. The existing Organizations visibility decision remains separate and is not reopened here. Service-only trust is confirmed by actual installed trust readback and structural principal checks; no live AssumeRole attempt was made.

## Regression and preservation

455 offline tests pass: six universal equivalence/policy-size tests, four simulator coverage-parser tests, 45 routed/compiled cursor/read tests, four pinned artifact tests, 349 Team/Core/frontend-contract/accounting/migration tests and 47 Legacy Team tests. TypeScript and migration-ledger reconciliation pass. Website build succeeds in temporary output with the existing stylesheet/chunk warnings; it is not published or substituted for the accepted epoch-5 frontend.

The product and ZIP were not regenerated. The compiled SDK test is verified against bytes present in the pinned ZIP. Only Read Code remains the proposed product modification. Command, complete Environment maps, runtime identities/boundaries, authority-status contract, Core contracts, D1 monitoring, tables/API and disabled branding/private-note behavior remain unchanged. Prior epoch-5 activation and rollback pins remain authoritative.

The targeted secret scan covers this correction's source, report and evidence; no credentials, private keys or authentication JWTs are found. No cursor secret value was retrieved. Unrelated workspace work is preserved; no Git commit, push or merge was requested or performed here.

## Separately authorized deployment plan

1. **Fresh preflight and artifact gate.** Verify account 058264289478/eu-north-1, approved security/deployment identities, installed baseline policies, authority LEGACY_WRITER 3/3, unchanged code/environments/data and protected domains. Verify the quota candidate, security/product/ZIP and rollback hashes. Stop on unexpected drift or any mismatch. Do not synthesize or rebuild.
2. **Exact artifact publication.** Under the reviewed publisher/security-owned path, publish only the pinned new ZIP, product template and exact existing desired rollback-template bytes at the reviewed keys. Verify object versions/content hashes. The normal product caller receives no upload or arbitrary-template permission. Old objects and rollback references remain accessible.
3. **Security-owner change set.** Prepare `ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity` using the pinned optimized security TemplateBody through the existing authorized security-owned path. Expected: exactly ExecutionRole, ExecutionBoundary and PreparationCaller modifications compared with installed security; zero additions, deletions or replacements, no nested stacks. Runtime roles/boundaries and trust must be unchanged. Inspect complete AWS-generated details and reject unexpected/conditional replacements. No broadening of the normal product caller to update security stacks.
4. **Security execution and readback.** Only after separate authorization and inspection, execute with rollback enabled, wait for UPDATE_COMPLETE, and read actual inline policy, attached policies, boundary versions, trust, sizes, new/rollback object access and negative controls. The current identity and either boundary version preserve foreign PassRole denial during either provider order. Stop on failure; allow rollback, collect evidence and do not patch permissions or retry automatically.
5. **Product change set.** Use the unchanged product hash and exact TemplateURL with the accepted product execution role. Expected: zero additions, exactly one ParityReadFunction Code modification, zero deletions/replacements and no unrelated properties. Reject Environment, Command, IAM, API/route, table or monitoring changes. Inspect complete AWS-generated details before separately authorized execution.
6. **Dark execution and acceptance.** Execute with rollback enabled. Verify actual Read code SHA, unchanged Command SHA, full unchanged Environment maps, Active/Successful, function drift IN_SYNC, installed runtime IAM and monitoring. Require authenticated authority 200 at LEGACY_WRITER 3/3 and all sixteen normal business routes' expected 403 denials. Verify zero source/target business changes, continuing Legacy frontend/source-policy state and protected-domain preservation.
7. **Rollback.** Before target business writes, restore the exact prior product via the pinned current-desired rollback URL; keep candidate security until the old ZIP/template is verified. Then restore accepted security if appropriate. No environment patch, data deletion, secret rotation or authority change. After target writes, use the separately reviewed state-aware maintenance recovery; a code rollback alone cannot restore Legacy authority.
8. **Maintenance gate.** Record the narrow runtime/product/security artifact amendment and refresh the maintenance package after dark deployment/live acceptance. Existing security-owner/operator and S3 risk acceptances remain preserved. FROZEN 4/4, installed writer-fence proof, reconciliation, TARGET_WRITER 5/5, five-persona real business acceptance, epoch-5 frontend activation and observation remain separate mandatory cutover gates. No Master publication or Legacy retirement.

No change set has been created or executed in this task. Offline expected classifications remain subject to AWS inspection.
