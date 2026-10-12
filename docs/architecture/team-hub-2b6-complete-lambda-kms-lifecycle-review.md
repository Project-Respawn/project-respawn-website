# Team Hub 2B6 — authoritative end-to-end Lambda recovery review

11 October 2026. **Prepared; not installed or executed. One consolidated authorization is required.** This supersedes recovery preparation summaries, not historical evidence. Recovery remains unaccepted until every live gate below passes.

## Diagnosis and selected mechanism

Both existing functions have eight environment variables rather than the declared Read twelve / Command eleven. Both lack `CORE_ENVIRONMENT`, `CORE_CONTRACT_ARN`, and `TEAM_HUB_BUSINESS_RUNTIME`; Read additionally lacks the cursor-secret ARN reference. The unchanged bundle fails initialization with this incomplete configuration. CloudFormation's desired configuration is already complete, so the ordinary repair change set had zero changes. Only the two function Environment drifts are confirmed; UNKNOWN log groups and unsupported integration inspection are not confirmed drift.

The first fixed recovery failed because the explicit Lambda NotResource deny did not exempt the exact `$LATEST` update ARN. The corrected attempt reached KMS but its inline policy Statement[2] explicitly denied `kms:Encrypt`. There was no temporary-role permissions boundary. Command was never attempted. Original deployment Decrypt denials correlate with the incomplete maps, but available CloudTrail does not establish every internal provider step. See the concise [failure matrix](team-hub-complete-recovery-evidence-2026-10-11/failure-matrix.json) and linked original histories; no historical failure evidence is overwritten.

Use the existing fixed temporary STANDARD Step Functions workflow and service-only role. It accepts only `{}`, checks pinned identities/revisions/code, submits the complete Read map, polls stabilization, then submits Command and polls. No Retry, arbitrary parameters, refreshed RevisionIds, code update or permanent-policy update. Two temporary resources; zero permanent resource additions/deletions/replacements. Directly restoring declared properties can reconcile function drift, but fresh function-level inspection must prove IN_SYNC.

## Complete lifecycle and minimum security change

The [permission matrix](team-hub-complete-recovery-evidence-2026-10-11/permission-lifecycle-matrix.json) separates the workflow caller, Lambda service, existing runtime roles and security custodian.

| Operation | Required path and restriction |
|---|---|
| GetFunctionConfiguration | Two exact unqualified function ARNs; precheck, polling and readback |
| UpdateFunctionConfiguration | Two exact unqualified and `$LATEST` forms; unpublished configuration only |
| Encrypt / Decrypt | Exact AWS-managed Lambda key; Lambda ViaService, account and exact unqualified Read/Command encryption contexts; time limit |
| DescribeKey | Observed in CloudFormation history, absent in inspected successful direct updates; excluded from this workflow role |
| CreateGrant / data-key generation | No caller grant requirement demonstrated for this unchanged default-key path; excluded from temporary role |
| Service-owned cryptography | Managed key policy and existing runtime roles retained; historical GenerateDataKey dry-run events do not prove completed generation |

Successful direct updates of these same functions on 6 October provide the service-mediated Encrypt/Decrypt context evidence. CloudFormation's 7 October path additionally used DescribeKey. The inspected direct window contains neither DescribeKey nor CreateGrant. The key is AWS-managed `alias/aws/lambda`, ARN `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`; none of its 43 inspected grants names Team Hub. This is evidence for the selected path, not a universal statement about every Lambda feature. [Read-only lifecycle evidence](team-hub-kms-lifecycle-evidence-2026-10-10/lifecycle-inspection.json), [direct history](team-hub-kms-lifecycle-evidence-2026-10-10/direct-success-history.json).

Relative to the qualified candidate, only five inline statements change: add Encrypt alongside Decrypt in Statement[1]'s exact-key conditional Allow; exempt Encrypt from Statement[2]'s NotAction deny; extend Statements[5–7]'s wrong-service/account/function-context denials to Encrypt. All other statements, trust, workflow, full maps, revisions and rollback pins are preserved. No broad KMS permission, grant administration, Secrets Manager permission, business-key exception, runtime IAM, PassRole or cross-domain grant. [Exact semantic diff](team-hub-complete-recovery-evidence-2026-10-11/semantic-diff.json).

Trust is `states.amazonaws.com`, exact source account and state-machine ARN. IAM cannot constrain individual Environment fields for UpdateFunctionConfiguration: the immutable workflow and service-only trust are therefore essential controls. The operator must not permit workflow editing/input substitution or attach extra policies/session permissions.

AWS documents default managed-key permissions separately from customer-managed-key grant setup; our explicit-deny restrictions still need to permit the observed service path. [AWS encryption guidance](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html). RevisionId and stabilization requirements follow the [UpdateFunctionConfiguration API](https://docs.aws.amazon.com/lambda/latest/api/API_UpdateFunctionConfiguration.html).

## Exact immutable authorization package

| Artifact | SHA-256 |
|---|---|
| Candidate | `4b4e49d07629dbb7fd4fa982bba30a10c3685dd0f989e8ae54161a128dd5470e` |
| Temporary security template | `b63d162ddf23d8fef1fe8e0f3ebbfa2096c8ffa655c3e93b15be39dac729830e` |
| Temporary identity policy | `06c4e9c0126ba4438acd87329442922a7d3b87eabf29092115b35db0979687fe` |
| Unchanged workflow | `862082291eb7052f069338212b552030678335afa93fc64ebeb2b28fea5a5376` |
| Unchanged runtime ZIP | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |
| Unchanged desired product template | `a48e15fa6dc9af763494ffbc9f7ee5a502c91b340351cfd550d39d442476bbad` |

[Manifest including preserved rollback/history pins](team-hub-complete-recovery-evidence-2026-10-11/artifact-manifest.json). Read RevisionId `4491176f-baaa-4180-8aa2-0e6e96bc51a8`; Command `50dc3a50-7388-467f-a302-1bf33cd051cf`. Exact original request files remain pinned in the manifest.

## Validation and uncertainty

210 AWS identity-policy simulations passed: 12 positives and 198 negative controls, covering both function forms, aliases/versions, wrong functions/principals' resource paths, wrong keys/context/service/account/time, code changes, IAM/PassRole and domain isolation. Trust principal/source constraints additionally require installed readback; identity simulation alone does not exercise role assumption. Access Analyzer returned zero findings for policy and trust; workflow and template validation passed. Custody has 14 positive operator checks and absent temporary role/machine/stack. [Security](team-hub-complete-recovery-evidence-2026-10-11/security-validation.json), [custody](team-hub-complete-recovery-evidence-2026-10-11/custody.json).

454 regression tests and 29 new integrity/trust tests pass; TypeScript, migration ledger and frontend build pass. Build warnings remain for the existing CSS path and large main chunk. No runtime ZIP was rebuilt. Offline compiled-bundle tests prove the valid-map authority response and all 16 dark-route denials against isolated dependencies, not live AWS acceptance. [Validation](team-hub-complete-recovery-evidence-2026-10-11/offline-validation.json).

The composite simulator rejected the actual managed-key policy's Resource `*`; it was not rewritten to force a pass. SCPs are enabled but ListPoliciesForTarget is denied to the operator. These are explicit visibility/model limitations, not evidence of an SCP denial. Fresh installed-role organization-aware simulation must pass before starting the workflow; absent/negative organization evidence requires stop and security-owner review. No IAM simulation proves live KMS service behavior. [Composite limit](team-hub-complete-recovery-evidence-2026-10-11/composite-key-policy.json), [organization limit](team-hub-kms-lifecycle-evidence-2026-10-10/organization-controls.json), [AWS simulator limits](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html).

A new scratch Lambda would introduce another protected-resource policy exception and would not prove these exact function contexts. No rehearsal resources are proposed. The guarded single recovery remains the necessary live service proof.

## One consolidated execution authorization request

Authorize only the pinned package above, under security custodian `arn:aws:iam::058264289478:user/RavenTest`, account 058264289478 / eu-north-1: create the exact two-resource temporary stack, run the fixed workflow once, perform read-only/live dark acceptance, and remove those temporary resources. Authorization must explicitly include choosing fresh NotBefore/ExpiresAt parameters with at least two minutes provisioning lead and a maximum 900-second window. Record and hash that parameter receipt before installation; these parameters do not authorize changes to policy/workflow/maps/revisions. If fresh-window parameter selection is not included in authorization, return the concrete receipt for approval before installation.

Execution gates, in order:

1. Refresh identity, all hashes, full actual/desired configurations, pinned RevisionIds, key metadata/policy, permanent policies/boundaries, source protections/backups, empty business data, authority LEGACY_WRITER epoch/version 1, frontend Legacy and absent source fence. Any unexpected change stops.
2. Validate window, operator custody and cleanup actions; simulate positive/negative paths inside/outside the window. Prepare and inspect the complete temporary change set: exactly one role and one state machine, no unrelated changes. Rollback enabled for temporary infrastructure.
3. Install only the approved temporary stack. Compare installed role trust, inline policy, no attached policies/boundary and exact workflow against pinned/parameterized bytes. Repeat actual-role effective checks including available organization evaluation. Stop and clean up if a required gate is inconclusive or denied. No broadening.
4. Start one uniquely named execution with `{}` while sufficient time remains. No automatic retry, RevisionId refresh or permission patch. Wait for terminal state and both functions' Active/Successful status. Preserve sanitized history/request IDs.
5. Compare complete maps and every stable non-environment property, code hashes and permanent IAM. Use `scripts/team-hub-recovery-complete/integrity.mjs` with captured live evidence. Recheck only the two function drifts; require IN_SYNC. Do not infer configuration health from stack completion.
6. Existing authenticated Ntgre session: authority HTTP 200, LEGACY_WRITER / 1 / 1; each of the exact 16 normal routes HTTP 403, no unauthorized business mutation. Verify no business records changed, expected request/log/metric correlation, D1 dimensions and bounded ingestion delay, no unexpected API 5xx. No tokens recorded. Failure remains failure, not a reason to alter authorization semantics.
7. Remove only the temporary stack/role/machine after terminal execution; confirm absence and archive sanitized evidence. Refresh Legacy 2621/167, Team 48+7, Core 8+5, Tournament 11, source recovery and authority/frontend preservation. Production unchanged.

On partial recovery or unexpected denial, stop without retry. Record which function updated and its actual revision. Remove the temporary executor once terminal; its expiry additionally closes permissions. Do not automatically restore the known-unhealthy maps. Restoring the previous accepted runtime/product requires a separate reviewed decision using preserved rollback artifacts. Temporary-stack rollback does not reverse a completed Lambda API call. Temporary 503s may persist during stabilization; recovery is accepted only after live checks.

## Current live status

Latest investigation readbacks retain both incomplete maps, unchanged ZIP/revisions, Active/Successful and the last confirmed MODIFIED Environment drift. Temporary executor absent; no AWS writes during this investigation. Preserved baselines: Team 48+7, Legacy 2621/167, Core 8+5, Tournament 11; authority LEGACY_WRITER 1/1, Operational zero, Journal only existing audit/control records, source protections intact. Last authenticated failure was 503; no new successful live endpoint, 16-route or D1 recovery acceptance is claimed. Fresh execution preflight is mandatory because evidence ages.

**LAMBDA RECOVERY READY — AWAITING ONE CONSOLIDATED EXECUTION AUTHORIZATION**
