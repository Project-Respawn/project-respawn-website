# Explicit domain build and deployment selection

5 October 2026. Mandatory reusable selection rule for Team Hub, Tournament and future Creator, Commerce, Community, Applications and Investor deployment units. This implements the [domain architecture standard](project-respawn-domain-architecture-standard.md)'s independent selection requirement. No AWS deployment or hosted configuration installation is authorized by this document.

## Root cause and correction

The former `npm run validate:infrastructure-ci` invoked `scripts/validate-infrastructure-ci.mjs` with no domain. `scripts/lib/infrastructure-inputs.mjs` recursively hashes all `amplify/`, `infrastructure/` and `scripts/`, excluding `node_modules` and `cdk.out` but not `.build`. New Team source and local generated artifacts therefore invalidated the Legacy receipt. The validator defaulted `AWS_BRANCH` to `master`, app ID to `d2cux232bpa951`, and launched `scripts/synthesize-resource-accounting.mjs`. That script uses `tsx` and the Amplify CDK context to import **`amplify/backend.ts`** and synthesize all Legacy stacks. Its Phase 2B1 run failed in `tsx` startup before reaching that entrypoint.

`amplify.yml` is the hosted workflow; there is no `.github` workflow directory in this checkout. It previously called that generic check and then unconditionally called `ampx pipeline-deploy`. Thus fixing only the local Team script would not fix the hosted execution boundary. Team's own isolated runner never had a Legacy fallback; the shared dispatcher and hosted workflow did.

The generic package command now calls [explicit selector](../../scripts/deployment/select.mjs). The old validator is isolated under `scripts/legacy/`, rejects direct use without explicit Legacy selection and staging identity, and no longer defaults to master. Its broad Legacy receipt algorithm is not silently rebased or refreshed. No Legacy synthesis was run to validate this correction.

## Contract

Mandatory arguments: `--domain`, `--env`, `--mode`, `--action`. No inherited default domain. Duplicate/unknown flags, missing fields, invalid environment/mode, absent entrypoint, unknown/unimplemented domain or failed subprocess stop the operation. No catch-and-retry against another domain. Every selected command records one domain and one product entrypoint; domain-owned security templates are separately counted.

| Domain | Environment / mode | Entrypoint | Status |
|---|---|---|---|
| team-hub | Ntgre / READ_PROOF | `infrastructure/domains/team-hub/read-proof-app.ts` | Local candidate build/check/test; no deployment adapter |
| team-hub | Ntgre / FULL_TARGET | `infrastructure/domains/team-hub/app.ts` | Offline future-state design; no deployment adapter |
| tournaments | Ntgre / PREVIEW | Existing `infrastructure/domains/tournaments/app.ts` | Existing runner delegated unchanged; selection tested with mocked execution, not synthesized during 2B2 |
| legacy | staging / LEGACY | Existing `amplify/backend.ts` via explicit Legacy validator | Only explicitly requested Legacy path; not run in this task |
| creator / commerce / community / applications / investor | Not yet registered with executable adapters | None | Fail closed until owner supplies reviewed entrypoint, lock, configuration and tests |

Actions `check` and `synth` build only the selected mode. Team `test` runs the 2B2 acceptance suite; Tournament `test` verifies its accepted checkpoint. `describe` prints the selected command without running it. `diff`, `deploy` and change-set execution are deliberately unsupported by the shared local selector at this gate. They must not shell out to a generic Amplify command as a convenience. Production/main/master environments always reject; a future production adapter requires a separately reviewed artifact-bound authorization process, not a generic force flag.

Examples from repository root:

```powershell
npm.cmd run validate:infrastructure-ci -- --domain team-hub --env Ntgre --mode READ_PROOF --action check
npm.cmd run validate:infrastructure-ci -- --domain team-hub --env Ntgre --mode FULL_TARGET --action check
npm.cmd run validate:infrastructure-ci -- --domain team-hub --env Ntgre --mode READ_PROOF --action test
npm.cmd run validate:infrastructure-ci -- --domain tournaments --env Ntgre --mode PREVIEW --action describe
```

The read proof and full target share the intended product stack name, but have separate app entrypoints, assemblies and mode-bound revisions. A FULL_TARGET artifact is not interchangeable with the reviewed READ_PROOF candidate. A future transition requires its own complete change-set review.

## Hosted execution

The backend section of [amplify.yml](../../amplify.yml) now invokes [hosted guard](../../scripts/deployment/hosted.mjs) for both check and deployment. Required configuration is `RESPAWN_DEPLOY_DOMAIN`, `RESPAWN_DEPLOY_ENV`, `RESPAWN_DEPLOY_MODE` plus an explicit `AWS_BRANCH`.

Team validation dispatches to Team only. Team/Tournament independent-domain deployment stops because no approved hosted deployment adapter exists. It cannot reach the old unconditional Amplify deployment. Only explicit Legacy/staging/LEGACY selection on the actual staging branch can reach the existing staging Amplify deploy command. Production branches stop pending their separate gate. The frontend section is byte-equivalent after line-ending normalization; no live client, output generation destination, branch connection or AWS environment variable was changed.

**Operational consequence:** after this source change is merged through an approved workflow, a hosted build without explicit selection will stop. Existing master/production builds also stop until a separately approved production adapter/gate is installed. This is fail-closed source preparation, not a claim that hosted rollout or production continuity has been tested. No push, merge, hosting configuration update or hosted run occurred here.

Development remains disconnected from AWS as reported previously. Staging/master connections were not inspected or changed live. The selector does not infer deployment authority from a branch name or from a local successful synthesis.

## Regression proof and future adapters

[Selection tests](../../scripts/deployment/tests/selection.test.mjs) exercise exact subprocess dispatch for Team, Tournament and explicit Legacy; missing/unknown/unsupported domain; wrong mode/environment; failed subprocess; missing entrypoint; production gates; hosted Team refusal to fall back; and explicit staging Legacy execution. Tournament/Legacy dispatch is mocked, so testing selection does not synthesize protected products.

The Team runner independently pins Core config, uses an isolated package, blocks synthesis networking/subprocesses, records actual esbuild/source/library closure and rejects unexpected roots. The preview closure contains only Team preview/auth/contracts and its independent infrastructure. No Amplify schema generation or shared `myFunction` bundle is selected. Both modes pass through the real generic CI command in the [2B2 validation evidence](team-hub-2b2-evidence-2026-10-05/gate.json).

Before registering another domain, supply: owner and independent root; explicit mode/environment/account allowlist; dedicated app/package/lock; pure approved contract dependencies; no fallback; actual closure and negative import tests; exhaustive resource/security counts; immutable artifact hashes; protected-root checks; and separate preparation/execution/production gates. Changed-file analysis may suggest affected domains, but must not silently choose a default or combine domains into one deployment. Hosted wiring must guard the actual deploy invocation as well as accounting.
