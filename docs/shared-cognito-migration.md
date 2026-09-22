# Shared Cognito accounts, separate branch data

Status: implementation candidate only. No AWS deployment or auth migration has been performed.

Latest local-target update: after the user created `Ntgre` and explicitly lifted the target-switch restriction, the existing `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332` deployment was verified as UPDATE_COMPLETE and adopted as the canonical local target. Local-output validation, the frontend/schema contract, and all 16 guard tests pass; `npm run dev` starts Vite. This uses Ntgre's own Cognito pool, not shared production auth. The deletion history and earlier blocked-state observations below are historical.

## Sandbox deletion update — 2026-09-21

After preparing this candidate, the user explicitly authorized: "Delete the entire Ntgrestage8 sandbox, including its database, uploads and Cognito users."

The exact root `amplify-projectrespawnwebsite-Ntgrestage8-sandbox-767a43f84e`, stack ID suffix `254f9a20-b5c3-11f1-adba-060feeb3ddad`, reached DELETE_COMPLETE. Verification at 14:17 UTC found none of its 52 tables, three buckets, AppSync API, user pool `eu-north-1_DdFojmzOR`, identity pool, or five leftover Lambda log groups. The retained sandbox KMS key `a9f021ef-8388-45b2-a259-895935854e82` is PendingDeletion, scheduled for 2026-09-28 at 14:16:50 UTC. The shared master user pool remains present, and the hosted master/staging/Demo branches were not deleted.

No replacement sandbox has been created. Local outputs remain stale and shared mode remains disabled. The earlier inspection below describes the state before deletion; its in-place sandbox recovery step is superseded. Any replacement/provisioning and shared-auth switch must be explicitly authorized under the repository's protected-infrastructure rules before proceeding. Deletion alone did not activate shared sign-in.

The local deletion inventory and verification evidence are saved under `.amplify/ntgrestage8-deletion/` (ignored generated files).

## Configuration

`amplify/auth/resource.ts` supports `RESPAWN_AUTH_MODE=shared` for hosted consumer branches. The default remains `managed`, so adding this code does not silently remove existing auth resources. `master` must remain managed because it owns the shared resources. Local shared mode is explicitly blocked pending the protected-sandbox exception and an in-place migration review.

The shared resource manifest is `amplify/auth/shared-resources.json`. These public resource identifiers were resolved and cross-checked through CloudFormation, Cognito user-pool/client inspection, identity-pool providers/roles, and group inspection on 2026-09-21. Reverify them before deployment; they are a snapshot, not credentials.

The shared pool is `eu-north-1_Uufjxul58` (Master Live User), owned by app `d2cux232bpa951`, branch `master`. Its client has no secret. Consumer branches use `referenceAuth`; they do not own or replace this pool, its client, identity pool, groups, or post-confirmation trigger. Master retains the signup trigger. Admin user management and Team Hub refer to the shared directory; AppSync and overlay authentication use the shared pool.

This candidate references the existing master **identity pool and IAM roles as well as the user pool**, as required by the existing Amplify auth/storage integration. Amplify attaches each consumer's resource-access policies to those shared roles. Databases, API endpoints, and buckets remain separate per branch, but IAM roles and account/group administration are shared. This is not a security boundary between production and test accounts. A design requiring separate branch IAM credentials would need branch-specific identity pools and role mappings instead.

Existing accounts in the other pools are not automatically merged. Records keyed by their old Cognito subjects, and private uploads keyed by their old identity-pool identities, do not automatically acquire the shared account's ownership. Preserve those resources and decide any account/data mapping explicitly; do not copy passwords or merge identities by email alone.

## Verified migration blockers

Read-only AWS inspection found:

| Environment | Existing user pool | State relevant to migration |
| --- | --- | --- |
| master | eu-north-1_Uufjxul58 | Owns the intended shared auth resources; retain managed auth |
| staging | eu-north-1_CoCCBuPJC | User-pool deletion policy is Delete |
| Demo | eu-north-1_ACS4GfLlA | User-pool deletion policy is Delete |
| Ntgrestage8 | eu-north-1_DdFojmzOR | Current root is CREATE_FAILED; auth and storage nested stacks completed, data failed |

The local outputs still contain absent pool `eu-north-1_X5BIIkPZR`. They must not be manually edited to substitute either pool. The current local contract is also missing `readTeamHub` and `mutateTeamHub`.

Switching an existing branch directly to `referenceAuth` removes its managed Cognito resources from the desired template. With the deployed Delete policies, a direct deployment can delete its old pool and users. Pool retention alone is insufficient: app clients, groups, identity pools, role attachments, IAM roles/policies, and trigger dependencies also need review and preservation.

The protected sandbox rules in `AGENTS.md` additionally prohibit repointing localhost to production auth without explicit target-specific authorization. This candidate does not bypass that rule or change local validation.

## Preview and validation

Run `npx tsx --test amplify/auth/mode.test.ts` and `npx tsc --noEmit -p amplify/tsconfig.json`.

`node scripts/preview-shared-auth.mjs staging shared` synthesizes a candidate locally. It uses the existing hosted branch identifier, writes to a new directory under `.amplify/shared-auth-preview`, and does not deploy or create a change set. It asserts that shared mode creates no user/identity pool and includes exactly one reference-auth resource. Use `staging managed` for comparison; `master managed` and `Demo shared` are also supported. It never replaces `amplify_outputs.json`.

The preview is not proof that an update is safe against the live deployment. Compare the candidate to the deployed templates, including all nested stacks, before deploying. Do not enable shared mode in hosting environment variables until the preservation phase has completed and been verified.

Validation completed on 2026-09-21:

- Amplify TypeScript check passed.
- Three auth-mode tests and 15 existing Amplify guard tests passed.
- Both staging managed and staging shared full-backend synthesis passed. Shared mode contains one reference-auth resource and no Cognito user/identity pools.
- Comparing those two local assemblies found the same 62 database/API/bucket resource identifiers and no changed table or bucket properties. This comparison isolates the auth-mode change; it is not a comparison against the older live staging code.
- The shared assembly removes 14 managed Cognito resources (pool, client, identity pool, role attachment and ten groups). The deployed staging and Demo user pools explicitly have Delete policies. Direct activation is therefore blocked until preservation is verified.
- Local-output validation remains blocked by missing `eu-north-1_X5BIIkPZR`; contract validation remains blocked by absent `readTeamHub`/`mutateTeamHub` in the existing generated outputs. No outputs were overwritten and no validators were bypassed.

## Required rollout order

1. Preserve the existing deployed auth resources and users in each consumer environment with an independently reviewed retention-only update. Confirm live retention policies before removing any managed resource from a template. Do not apply unrelated backend changes in that preservation update.
2. Superseded by the authorized deletion recorded above: there is no remaining sandbox to repair in place. Agree and authorize the replacement provisioning scope before creating any sandbox resources.
3. Obtain the explicit exception for Ntgrestage8 to use master auth while retaining its own data/storage deployment. Adapt local validation to verify the exact shared auth owner and the protected local data/storage owner separately; continue to reject mixed or unexpected resources.
4. Review the complete backend diff and enable the shared-auth reference in the existing sandbox only after the exception and preservation checks. Generate outputs through Amplify from that deployment and run local-output/contract validation. Test signup, login, group authorization, account lookup, API access and storage access with non-sensitive test records. Verify each operation reaches that environment's API and bucket.
5. Migrate staging, then Demo, with their separate backend resources and generated outputs. Keep master managed. Set the shared mode for future consumer branches only after their deployment plan has been checked.

No user migration, pool deletion, sandbox recreation, or production data sharing is authorized by this document.
