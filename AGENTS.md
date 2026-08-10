# Repository Agent Instructions

## LOCAL AMPLIFY SANDBOX — PROTECTED INFRASTRUCTURE

The canonical local sandbox identifier is `Ntgrestage8`. Treat it as protected infrastructure and resolve its generated AWS IDs dynamically.

Unless the user explicitly says the equivalent of **“I authorize you to delete/recreate/replace the Ntgrestage8 sandbox”**, Codex must not delete or recreate it, change its identifier, create a replacement/parallel local sandbox, switch localhost to another sandbox, repoint `amplify_outputs.json` to staging/production, manually replace generated Cognito/AppSync IDs, delete/replace its Cognito pool, migrate local users, run destructive sandbox/CloudFormation/Cognito commands, or blindly recreate infrastructure to repair schema/client drift. Generic requests such as “fix localhost”, “fix Amplify”, “redeploy the backend”, or “repair the sandbox” are not replacement authorization.

Codex must inspect before modifying, distinguish local/staging/production, preserve Cognito users/groups, prefer an in-place update, run `npm run validate:local-outputs` before localhost work, and run `npm run validate:amplify-contract` after Amplify schema changes. Stop and report before any action that may select a new stack or replace Cognito/AppSync. Follow [docs/local-amplify-development.md](docs/local-amplify-development.md) for every Amplify change.
