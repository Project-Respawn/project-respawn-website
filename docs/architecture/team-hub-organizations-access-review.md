# AWS Organizations access review — Team Hub recovery

11 October 2026. Read-only review and policy preparation; **no installation or Lambda recovery authorized by this report**.

## Account and identity

Fresh DescribeOrganization confirms organization `o-w6qzgozcgy`, management account `195275633034`, ALL features. Account `058264289478` is a **member account**. Current identity is `arn:aws:iam::058264289478:user/RavenTest`.

Available profiles are default, project-respawn and codex-master-oauth. STS identification for both alternative profiles returned expired-login-session errors. Their names do not establish account identity or management access. RavenTest's ListDelegatedAdministrators was denied. No usable approved management/delegated inspection identity has been established. No credentials, tokens or organization contact email were collected in evidence.

Use an existing approved inspection role in **management account 195275633034** first. Its exact ARN and custodian are currently unknown. Alternatively use an already designated delegated administrator with verified read access, without registering a new delegate for this task. These operations require a management or delegated-administrator account; an identity-policy grant to an ordinary member is insufficient. [AWS account eligibility](https://docs.aws.amazon.com/organizations/latest/APIReference/API_ListPoliciesForTarget.html).

## Proposed permission document

[Exact inspection policy](team-hub-organizations-access-evidence-2026-10-11/inspection-policy.json), with hash and validation in [validation receipt](team-hub-organizations-access-evidence-2026-10-11/validation.json).

The user's repeated `organizations` entries are resolved to these actual read actions:

| Action | Purpose and scope |
|---|---|
| organizations:DescribeOrganization | Confirm organization/account; Resource * required |
| organizations:ListParents | Exact member account and this organization's OUs; traverse ancestors |
| organizations:ListPoliciesForTarget | Exact member account plus this organization's OUs/root; SCP filter condition |
| organizations:DescribePolicy | Only this organization's SCP ARNs and AWS-managed SCP ARNs |
| organizations:ListRoots | Confirm root policy-type enabled status; Resource * required |

Every statement requires `aws:PrincipalAccount=195275633034`. SCP-specific statements additionally require `organizations:PolicyType=SERVICE_CONTROL_POLICY`. The policy intentionally does not grant the member-account caller access. No regional condition is added to this global service. No Organizations write, IAM, STS AssumeRole, Lambda or KMS grant is included. [AWS resource and condition support](https://docs.aws.amazon.com/service-authorization/latest/reference/list_organizations.html).

OU/root and SCP suffix wildcards are confined to this organization because ancestor and attached policy IDs are not yet visible. This discovery scope can read other OUs/SCPs within the organization, but cannot enumerate other account parents or attachments. Prefer an existing owner-supplied ancestry/policy inventory to replace those suffixes with exact ARNs before installation. If unavailable, the administrator must explicitly approve this bounded discovery scope. Resource * is limited to the two actions without resource-level support. AWS-managed FullAWSAccess uses an `::aws:policy/service_control_policy/` ARN, which is separately covered.

DescribeEffectivePolicy is excluded: it does **not** aggregate SCPs. ListAccounts, ListChildren, ListPolicies and delegated-administrator registration are unnecessary for the target-to-root walk. [AWS API limitation](https://docs.aws.amazon.com/organizations/latest/APIReference/API_DescribeEffectivePolicy.html).

## Exact administrator action and custody

No attachable target identity has been verified, so this is a permission-document proposal, not an installation-ready role/trust package. The authorized IAM/Identity Center administrator **of management account 195275633034** must identify the existing approved inspection role or permission set and review its effective permissions, trust and custody. If it already has the five reads, use it without changes. Do not attach anything to RavenTest or Team Hub roles.

If access is missing, proposed change is one temporary inline permission document named `ProjectRespawnTeamHubScpInspection` on that confirmed management inspection role, containing exactly the linked policy. Administrator must approve the actual target ARN and document hash before installation; no guessed role name or cross-account trust is proposed. For an Identity Center role, use its approved permission-set process instead of editing the generated role directly. If no inspection identity exists, a separate management-account role requires a separately reviewed exact operator trust policy; that principal cannot be safely invented here.

The named management-account custodian should use a short existing federated session, preserve sanitized audit evidence and remove only this temporary inline grant when inspection finishes. Existing-role unrelated permissions must be checked: negative tests of this document alone do not remove grants from other policies. Management account ownership does not make a proposed role authorized automatically.

## Validation and subsequent inspection

Access Analyzer and IAM simulation results are recorded in the linked receipt. Positive controls cover metadata, target/OU/root traversal and customer/AWS-managed SCP reads. Negative controls cover other accounts/organizations/policy types, member-account use, SCP edits/delegation, IAM PassRole, Lambda update and KMS decryption. These are supplied-policy tests, not live management-identity acceptance.

After an existing approved identity becomes available, or after separately authorized installation:

1. Verify STS account and approved role; DescribeOrganization must match the above organization.
2. ListRoots and confirm SCP enabled state. Traverse ListParents from 058264289478 through every OU to root. Exhaust NextToken even on empty pages.
3. At every account/OU/root level, list SERVICE_CONTROL_POLICY attachments and read each exact policy. Preserve parent chain, policy IDs/content hashes, collection time and caller identity. Re-read attachments/ancestry to detect changes during collection.
4. Evaluate the exact temporary recovery role, both Lambda unqualified/$LATEST update ARNs, GetFunctionConfiguration and exact Lambda KMS key Encrypt/Decrypt paths. Include actual service/account/function encryption context, principal ARN, region and chosen time window where conditions reference them. Explicit deny at any ancestor blocks; required allows must survive every hierarchy level. Missing condition context or policy pages is unresolved, not allowed. [SCP evaluation](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps_evaluation.html).
5. Record each action/resource as unrestricted by SCP, restricted, or unresolved with matching statements. SCP inspection alone does not prove IAM/boundary/session/key-policy/runtime authorization. Retain all original Lambda recovery gates and refresh preflight; do not resume recovery during this access-review task.

## Current outcome

SCP visibility remains unavailable. Whether applicable SCPs restrict Lambda UpdateFunctionConfiguration or KMS Encrypt/Decrypt is **UNKNOWN**. Required external dependency: an authenticated, approved management-account inspection identity or verified existing delegated-administrator path. No policy installed; no organization, recovery, permanent runtime, authority, frontend or production change.
