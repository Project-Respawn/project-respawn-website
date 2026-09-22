# Repository Agent Instructions

## ARCHITECTURE ASSESSMENT FOR SUBSTANTIAL FEATURES

The existing Amplify Gen 2 backend is **LegacyPlatform**. Preserve its existing resources, but do not add substantial new product domains there by default. Follow the LegacyPlatform decision checklist in the linked feature rule. Logical ownership does not imply physical stack ownership. `backend.createStack()` and nested stacks are not independent deployment units; justified future domains use sibling roots. Do not create one root per small feature. Phase 1 safeguards and consolidation preparation are approved; deployment and subsequent migration phases require separate authorization.

Follow [docs/architecture/adding-a-new-feature.md](docs/architecture/adding-a-new-feature.md) before implementing substantial features. Record domain/module ownership, shared contracts, effective generated resource costs, template/root budgets, frontend lazy loading, deployment boundaries and stateful migration implications. The overall direction is approved; this rule does not authorize infrastructure migration or override the sandbox protections below.

## LOCAL AMPLIFY SANDBOX — PROTECTED INFRASTRUCTURE

The canonical local sandbox identifier is `Ntgre`. Treat it as protected infrastructure and resolve its generated AWS IDs dynamically.

Unless the user explicitly says the equivalent of **“I authorize you to delete/recreate/replace the Ntgre sandbox”**, Codex must not delete or recreate it, change its identifier, create a replacement/parallel local sandbox, switch localhost to another sandbox, repoint `amplify_outputs.json` to staging/production, manually replace generated Cognito/AppSync IDs, delete/replace its Cognito pool, migrate local users, run destructive sandbox/CloudFormation/Cognito commands, or blindly recreate infrastructure to repair schema/client drift. Generic requests such as “fix localhost”, “fix Amplify”, “redeploy the backend”, or “repair the sandbox” are not replacement authorization.

Codex must inspect before modifying, distinguish local/staging/production, preserve Cognito users/groups, prefer an in-place update, run `npm run validate:local-outputs` before localhost work, and run `npm run validate:amplify-contract` after Amplify schema changes. Stop and report before any action that may select a new stack or replace Cognito/AppSync. Follow [docs/local-amplify-development.md](docs/local-amplify-development.md) for every Amplify change.
