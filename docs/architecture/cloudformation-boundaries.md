# CloudFormation boundaries and resource budgets

Status: architectural direction approved. Phase 1 accounting and CI safeguards are implemented locally; no AWS deployment has occurred. See [Phase 1 review](phase1-implementation.md).

## Implemented Phase 1 guard

`npm run validate:amplify-stack-size -- <assembly>` now traverses the cloud assembly manifest from one selected root. It counts every deployed nested instance, rejects ambiguous roots/missing nested assets/cycles/path escapes, ignores stale unreferenced templates, and reports all template counts, recursive totals, generated contributors, module estimates and resource types. Use `--root <artifact-id>` for multi-root assemblies and `--json <file>` for machine-readable evidence. The default operation is **create**; the 2,628-resource candidate therefore correctly fails.

`--baseline <report.json>` adds before/after totals and module/template/type deltas. `--operation update --exception <debt.json>` supports a bounded existing-debt assessment, not deployment approval. The checked-in candidate receipt covers only the exact master/staging roots, expires 2026-10-21, pins its baseline with SHA256, and allows **no hierarchy or individual-template growth/new stack contributions**. It does not waive the 480 internal template gate. No allowance is permitted for creation. Update operation size remains UNKNOWN until a later reviewed AWS plan; the declaration total is not falsely treated as the number touched by an update.

`npm run validate:infrastructure-ci` is wired into the existing Amplify backend build before its pre-existing deployment command. It compares normalized infrastructure-source receipts, including backend/configuration, scripts, package/lockfile and amplify.yml. Unchanged source in the covered managed-auth branch context reports existing debt and skips synthesis, so frontend-only changes are not blocked by pre-existing infrastructure size. Changed inputs or `--force` / `RESOURCE_ACCOUNTING_FORCE=1` trigger a new, branch-aware **synthesis-only** assembly and the budget gate. Unknown branch/auth contexts never take the receipt shortcut. This task did not run the hosting pipeline or its deployment command.

The receipt is a reviewed count ceiling, not cryptographic protection against a reviewer changing both policy and hash. Baseline, source receipt, roots, expiry or budget changes require explicit review and must never be automatically refreshed to hide growth. Per-model stacks are attributed by their existing logical names; shared function directives remain under shared/generated infrastructure rather than being falsely allocated to one product. More precise resource-level ownership can extend this without changing count semantics.

Commands:

```text
npm run test:resource-accounting
npm run test:handler-consolidation
npm run validate:amplify-stack-size -- <assembly> --json <report.json>
npm run validate:amplify-stack-size -- <assembly> --baseline scripts/config/legacy-resource-baseline.json --exception scripts/config/legacy-resource-debt.json --operation update
npm run validate:infrastructure-ci -- --force
node scripts/compare-handler-consolidation.mjs <baseline-assembly> <candidate-assembly> <report-directory>
```

Thresholds are fixed in `scripts/lib/cloudformation-accounting.mjs`; the former single `AMPLIFY_STACK_RESOURCE_LIMIT` override is no longer used. A CLI success under an existing-debt allowance is explicitly labelled as such and never printed as fresh-create safety.

## Deployment units

A source module is a code boundary. A CDK construct is a composition boundary. A nested stack is a template boundary. An independently deployed root with its own pipeline is a release boundary. They are not interchangeable.

Current `backend.createStack('api-stack')` and `backend.createStack('overlay-source-stack')` are part of the same Amplify root. They permit separate templates but not independent `ampx pipeline-deploy` domain releases. Keep their existing IDs unchanged during unrelated refactoring. The data resource's installed factory allows one `defineData` per Amplify backend.

New independent domain backends should be sibling roots with narrowly defined Core inputs and exported endpoint contracts. Do not place all new roots beneath `ProjectRespawn-Platform` as nested stacks. Organize products in the repository and dashboards instead. Shared libraries may compile into multiple Lambdas; they should not introduce mutual deployment dependencies.

For existing generated models, a façade can establish ownership while the table remains in the old stack. Such a façade improves code/permission boundaries but does not yet remove generated resource cost or isolate that table's deployment. Report this transition honestly.

## Budget policy

AWS specifies 500 resources per template and 2,500 resources involved in a nested-hierarchy operation. Total hierarchy size is a conservative fresh-create measure; it is not the count changed in a particular update. Account concurrency/service quotas are additional constraints, not substitutes for these limits. [AWS CloudFormation quotas](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-limits.html)

| Measure | NORMAL | WARNING | ACTION REQUIRED / block |
| --- | --- | --- | --- |
| Every individual template | 0–250 | 251–350 | 351+ requires redesign/explanation; proposed CI rejects new growth above 350 without explicit temporary exception; retain hard gate at 480 |
| New independently deployed root, recursively counted | 0–1,000 | 1,001–1,800 | Above 1,800 blocks unreviewed growth; leaves headroom below 2,500 |
| Proposed operation's affected nested resources | Up to 1,500 | 1,501–2,000 | Above 2,000 requires smaller rollout; never assume operation above 2,500 can succeed |
| Growth from approved module baseline | <10% and <25 added resources | Either 10% or 25 additions | >20% or >50 additions requires owner/budget review even if absolute count is low |

These are engineering guardrails, not new AWS quotas. Small future units should normally remain below 250 resources. Estimate bands in the stack map do not authorize growth to the warning boundary. Every legacy exception must name root ARN, source/template revision, owner, permitted delta and a removal milestone. Existing 475-template / 2,936-tree production is explicitly **ACTION REQUIRED**, not a grandfathered green result. Count metadata, custom providers, tables, IAM, resolvers, permissions, nested handles and generated functions.

At the initial audit, `scripts/validate-amplify-stack-size.mjs` only rejected templates above 480 and could pass at 475 while the hierarchy exceeded 2,500. Phase 1 replaces that behavior as described above. Do not sum `.amplify/artifacts/cdk.out` indiscriminately: it can contain multiple generations. Use a dedicated fresh assembly and an explicit root where required.

## Accounting design and remaining operation review

Extend the existing script rather than introduce a competing count definition:

1. Accept one cloud assembly manifest and selected root/environment, not an arbitrary mixed artifact tree.
2. Traverse each selected nested asset from the root. Count each deployed stack instance once by root/construct identity; the same template instantiated twice counts twice. Exclude unrelated roots, old assemblies and test scenarios.
3. Report direct and recursive counts per root, resource type, owning domain, stateless/stateful category, and before/after delta. Attribute generated model and handler resources as well as handwritten constructs.
4. Compare with a checked-in budget manifest and baseline template hashes. Fail on wrong account/region/environment, unknown owner, replacement of protected resources, unapproved growth or missing nested assets.
5. Retain a separate change-set/operation review for actual updates; static tree sums cannot prove the number AWS will touch. Include custom-resource side effects and nested template changes in human review.
6. Publish JSON plus a compact CI table. Test nested duplication, multiple roots, missing files, same template instantiated twice, deleted resources and boundary values.

Budget regressions should include: 79 handler operations remain consolidated into the intended shared data sources; generated authorization functions still exist; `readTeamHub`/`mutateTeamHub` retain action-level authorization; a new operation does not unexpectedly add a role/data source/policy per field.

## Effective cost and deployment performance

The current FunctionDirectiveStack cost is `79 × 6 + 1 = 475`: per operation one data source, two functions, resolver, role and policy, plus metadata. Candidate cost is `79 × 2 + 2 × 4 + 1 = 167`: authorization/resolver per operation, invocation/data-source/role/policy per handler anchor. Handler reuse must not collapse authorization boundaries accidentally.

Model stacks also generate many resolver pipelines, so new data features need a synthesis delta before estimates are accepted. The production family has 1,678 AppSync function configurations overall; function-directive consolidation addresses only part of that.

Independent roots permit targeted synth/deploy and smaller failure domains if CI selects the affected unit. Multiple nested templates in the same root do not remove full-backend synthesis. Separate roots add monitoring, contract, pipeline and coordination work; only adopt when isolation or growth pays for that complexity. Measure synth duration, change-set size, deployment p50/p95 and failure recovery separately from browser bundle/route timing. This audit's build time is not a benchmark of deployment speed.

## Dependencies and security

The current root parameter graph ties auth to data/storage, APIs to handlers, overlay to workspace/data/auth resources, and runtime to overlay grants. The complete evidence preserves parameter bindings and Ref/GetAtt/Sub/ImportValue edges. The dedicated runtime is intentionally the overlay consumer; moving its grants back to `myFunction` risks a data/overlay cycle. See [Amplify circular dependencies](https://docs.amplify.aws/vue/build-a-backend/troubleshooting/circular-dependency/).

Future IAM belongs to the function/domain making the call: exact table/index ARNs, bucket prefixes, API invoke permissions, required secret ARNs and KMS encryption context where supported. Cognito administrative permissions should be scoped to the actual pool and needed actions after authorization regression tests. Keep elevated operations separate from public webhooks. CORS `*` is not authorization; examine each handler's signature/JWT/capability validation before changing policy. Broad resource grants in source warrant review but are not alone proof that an unauthenticated caller can exploit them.

Use no reciprocal domain table-write grants. Events/projections can eliminate some read dependencies, but strongly consistent authorization may require a synchronous owner contract. Do not introduce an event bus and a new universal shared Lambda that recreates the same coupling.
