# Team Hub Phase 2B1 offline application

This package has its own lockfile and toolchain. It creates only local build artifacts. There is no deployment command, AWS SDK or live endpoint descriptor.

From the repository root:

```powershell
npm.cmd ci --offline --ignore-scripts --prefix infrastructure/domains/team-hub --no-audit --no-fund
npm.cmd run typecheck --prefix infrastructure/domains/team-hub
node scripts/team-hub/plan.mjs --env Ntgre --offline
node --test scripts/team-hub/tests/*.test.mjs
```

The offline install requires the pinned npm packages already in the local cache. If unavailable, a normal `npm ci --ignore-scripts` installs the same lockfile; neither command deploys AWS resources.

Synthesis packages read/command handlers which always return `OFFLINE_SKELETON`. Synthetic repositories and Core adapters are injected only into tests. The app uses explicit account/region and the pinned shared Core descriptor, performs no lookups, and produces the Team product root plus a separately counted Team security root. Runtime assets use the existing CDK asset protocol but are **not published**. No bootstrap bucket is created or changed.

The synthesis subprocess blocks networking and child processes, strips AWS credential/config environment variables, records actual loaded libraries and esbuild input closure, and rejects foreign roots/imports. `.build/` and `node_modules/` remain ignored. No `ampx`, shared `myFunction`, Legacy or Tournament entrypoint is loaded.

Phase 2B2 replaces the generic CI fallback with mandatory domain selection:

```powershell
npm.cmd run validate:infrastructure-ci -- --domain team-hub --env Ntgre --mode READ_PROOF --action check
npm.cmd run validate:infrastructure-ci -- --domain team-hub --env Ntgre --mode FULL_TARGET --action check
node scripts/team-hub/verify-2b2.mjs
```

READ_PROOF synthesizes only one authenticated synthetic preview Lambda/API and its security definitions (15 resources); FULL_TARGET retains the 46-resource future stateful design. Preview handlers return explicitly synthetic data. The full-target handlers still return `OFFLINE_SKELETON`. Neither command deploys, prepares change sets or installs IAM. Missing/unknown selections fail closed. Hosted deployment of independent domains remains disabled; production requires a separate gate. See [selection standard](../../../docs/architecture/domain-deployment-selection.md).

See [implementation and gates](../../../docs/architecture/team-hub-2b1-implementation.md), [API](../../../docs/architecture/team-hub-v1-api-contract.md), [authorization](../../../docs/architecture/team-hub-authorization-matrix.md) and [resource accounting](../../../docs/architecture/team-hub-2b1-resource-accounting.md).
