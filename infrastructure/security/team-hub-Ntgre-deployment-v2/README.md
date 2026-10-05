# Team Hub deployment security correction (uninstalled proposal)

This security-only successor consumes the preserved Release 1 product receipt. It never synthesizes or rebuilds the product, changes runtime policies, or calls an AWS write API. The old four-resource security template remains historical and must not be used for deployment. The new security template and the old product are paired by the evidence manifest, not by claiming the old combined security hash still applies.

Run from the repository root:

1. `node infrastructure/security/team-hub-Ntgre-deployment-v2/inventory.mjs` — authenticated read-only REST/HTTP/WebSocket inventory; unexpected Team resources stop the build.
2. `node infrastructure/security/team-hub-Ntgre-deployment-v2/build.mjs` — offline security templates/policies and manifest. Checks all original source/artifact pins. Expiry is fixed at inventory timestamp plus 24 hours, not execution time.
3. `node --test infrastructure/security/team-hub-Ntgre-deployment-v2/security.test.mjs` — preservation, size and binding checks.
4. `node infrastructure/security/team-hub-Ntgre-deployment-v2/validate.mjs` — authenticated read-only Analyzer and IAM simulation. Inconclusive simulator results fail the review; they are never treated as explicit-deny proof.

Generated review artifacts live in `docs/architecture/team-hub-2b2-security-correction-evidence-2026-10-05`. Refreshing inventory or code produces a new security revision. Preserve historical evidence before rerunning a review. No deployment command or automatic installation adapter is provided.

## First-create controls

The execution identity and boundary use practical regional API Gateway authority with explicit denies covering every inventoried API ID anywhere in its resource path, including decoded/encoded tagging paths. This intentionally over-denies names containing a protected ID. REST API paths are denied too. The role's non-API statements, runtime boundary and role trust remain unchanged. A fixed expiry removes API Gateway authority even if an operator fails to perform lockdown. Do not begin an execution near expiry: leave time for completion, verification, lockdown and rollback. Expiry must not be extended silently; renewal requires new inventory and review.

Before a separately authorized installation, refresh the inventory and reject any new API or changed ownership. The role can manage APIs created after the snapshot and other regional API Gateway service resources until expiry/lockdown. It does not intrinsically identify an API that has not yet been created. Avoid concurrent unrelated API provisioning during that window. The exact account/region, product template/ZIP, stack and execution role must be verified; the complete change set must be inspected and rollback enabled.

The product deployment caller policy must be its effective permissions ceiling (the same document as identity policy and permissions boundary, on a reviewed dedicated caller). It permits only the Team product stack, its exact execution role and the hash-addressed product template URL. It cannot directly modify API Gateway, install security, change another stack or pass another role. The policy remains unattached in this four-resource proposal. Do not substitute the broad bootstrap principal for this restricted product caller. The future installation gate must establish the actual caller and effective policy; no caller was provisioned here.

## Immediate post-create lockdown

After the product reaches CREATE_COMPLETE/UPDATE_COMPLETE and its eleven identities and pinned template are verified, **before runtime acceptance or another deployment**, retrieve the physical `HttpApi` ID and its name/type from fresh AWS readback. Use the pure `bindSteadyState` function with that evidence. It rejects production/wrong account/region/stack, a protected existing ID, the simulation fixture, mismatched resources and a different product template. Do not directly fill a parameter from a guessed API ID.

The parameterized steady-state security template replaces both the execution boundary document and the execution role's inline policy. It leaves the runtime boundary, caller policy, role identity/trust and all product resources unchanged. A separately authorized security custodian must inspect a two-resource modification plan with zero additions/deletions/replacements, execute it with rollback enabled, and read back canonical equivalence of BOTH policies. Revoke/remove non-default broad managed-policy versions after successful replacement where applicable and separately authorized. The product execution role cannot change its own boundary or policies.

Then rerun simulations against the actual API ID and installed policies: own lifecycle allowed, every other API and the collection CreateApi path denied. If binding, update or readback fails, Release 1 cannot be accepted and no further product action is permitted. Stop and preserve evidence; do not extend bootstrap authority or retry with broader permissions. The hard expiry remains a fallback, not permission to defer lockdown.

The simulation fixture `thproof123` is not a live endpoint or an installable API binding. The eventual bound steady-state template will have a new concrete hash, which must be recorded and reviewed. Simulation of that fixture does not prove a CloudFormation deployment or internal tagging call will succeed.
