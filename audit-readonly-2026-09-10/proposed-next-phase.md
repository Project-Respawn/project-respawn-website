# Proposed next phase  -  review only

No automatic fixes, cleanup or deployment follows this audit.

1. Review executive-summary.md and the exact resource/stack inventories. Confirm intended owners for every nonproduction environment.
2. Investigate the protected Ntgrestage8 Cognito AttributeDataType failure through a separately authorised, in-place-compatible change proposal. Do not recreate/repoint the sandbox or replace identity resources.
3. Review production FunctionDirectiveStack capacity: 475 against repository guard 480. Design and test a separately reviewed schema/stack change before further expansion; AWS template maximum is 500 ([AWS quotas](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-limits.html)).
4. Decide recovery protection for data-bearing tables and retention requirements for logs. Prepare exact resource changes, costs and rollback plans for approval before applying anything.
5. Review public bucket purpose, generated IAM wildcard scopes, CORS and RavensBot runtime ownership. Preserve public assets that intentionally serve a site; never infer private-data exposure without evidence.
6. Resolve provisional candidate ownership, external dependencies, monitoring coverage, retention, backup decisions and rollback plans. Observe at least 90 days or the appropriate business cycle. No candidate is retire-ready.
7. Handle frontend bundle/image/stylesheet work as a separate application change with a fresh build and browser measurement.

Any unresolved access/throttling or metadata limitations are evidence gaps, not grounds for deletion. The ZIP is for review and contains infrastructure identifiers and security findings; no credentials, API-key values or private user documents are intended to be included.

