# Protected Local Amplify Development

`Ntgrestage8` is protected local infrastructure. Generated Cognito, AppSync, identity-pool, table, function, and bucket IDs are not stable identity; resolve them from outputs, tags, and CloudFormation.

## Safe startup

Terminal 1: `npm run dev:sandbox`. The preflight must identify the currently generated `Ntgrestage8` root. If `ampx` prints a different root stack, stop immediately. Terminal 2, after deployment/output generation: `npm run dev`. Sign out/in after any Cognito pool change.

The preflight cannot prove in advance what CDK will replace. It is a target check, not replacement authorization.

## Mandatory Amplify change procedure

For changes to `amplify/data/resource.ts`, `amplify/auth/**`, `amplify/backend.ts`, `amplify/myFunction/**`, or other infrastructure:

1. Inspect the existing `Ntgrestage8` resources and current outputs.
2. Run static tests and `npx tsc --noEmit -p amplify/tsconfig.json`.
3. Determine whether the change is compatible with an in-place update.
4. Never recreate a sandbox to solve generated-client metadata drift.
5. Update only the existing sandbox; stop if a different root stack would be selected.
6. Regenerate outputs from that same deployment.
7. Run `npm run validate:local-outputs`.
8. Run `npm run validate:amplify-contract`.
9. Restart Vite and sign in again only when auth identity changed.
10. Test the affected feature locally.
11. Only then consider hosted staging.

## Explicitly protected actions

`ampx sandbox delete`, CloudFormation deletion, Cognito pool deletion/replacement, changing the sandbox identifier, switching outputs to another environment, and manual sandbox replacement require explicit target-specific user authorization. A general repair/debug/deploy request is insufficient.

Never place passwords, tokens, Merchant secrets, or API secrets in tracked files. Local backend secrets use `npx ampx sandbox secret set <NAME> --identifier Ntgrestage8`.
