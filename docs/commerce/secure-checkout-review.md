# Secure Commerce checkout — local completion review

Prepared 22 October 2026. **Production release: NO-GO.** This branch completes the secure checkout source and isolated offline demonstration. It does not authorise deployment, live transactions, new Commerce infrastructure activation or removal of the production hold.

The review branch is `commerce/secure-checkout-review-20261022`, based on remote master `a83a874dad50395518fb0d7e2f1e853cf6bf2513`. The original dirty `phase2/team-hub-extraction` worktree was preserved. No Team Hub, Twitch, authentication, SWG, generated outputs, deployment workflow or recovery artifact changes are included.

Implemented behaviour:

- Product Control configures independent GBP/EUR/USD integer minor-unit prices through the existing `products.edit` permission. Blank currencies are disabled; supplier synchronisation cannot set these prices. Printful storefront displays use configured prices rather than imported supplier prices. No foreign-exchange conversion exists.
- Active product, variant, Printful mapping, quantity, recipient and configured price are validated server-side. Limits are 30 distinct lines, 20 units per line, 50 units overall and the currency registry's amount ceiling. Browser money, mappings, payment state and fulfilment instructions are not authoritative.
- Configured merchandise prices include applicable tax. Customer shipping is zero. The payable total equals the merchandise gross subtotal; included tax is informational, not added again. Printful shipping is calculated internally and retained as `merchantShippingMinor`, excluded from the customer projection. The order snapshot, including commercial policy references, is hash-bound and protected by conditional ledger writes.
- The legal seller is Ravens Community; the customer-facing brand is Project Respawn. No FreeAgent integration, accounting export or duplicate sales-record workflow was added.
- The tax adapter requires a reviewed, time-bounded backend policy with an approval reference, exact product/currency/destination scope and explicit postcode inclusions/exclusions. It supports a single unambiguous uniform-rate inclusive treatment with aggregate integer half-up rounding. Mixed or unapproved treatments fail closed. The default policy has **no approved rules or destinations**. Test rates and `TEST` postcodes are synthetic and are not tax advice or approved business configuration.
- Persist-before-payment and conditional payment creation prevent automatic re-creation of an uncertain session. Revolut receives the exact snapshot amount/currency. Signed webhooks verify the authoritative payment, environment, reference, amount, refunds and payment ID before fulfilment. Refund orders are correlated with the original payment; pending, partial and full refunds are distinguished. Closing the browser payment form does not claim that a provider payment was cancelled.
- Secure guest capabilities remain hashed at rest, scoped, expiring, revocable and memory-only in the browser. Cognito access tokens are checked through Cognito, not authenticated by decoding alone. Customer status is ownership-checked and excludes addresses, email, provider identifiers and payment tokens. A reference or email alone never grants access.
- Atomic legacy claims reuse the existing AppSync conditional update. V2 uses conditional DynamoDB writes; payment, submission and confirmation attempt IDs persist. Timed-out or ambiguous submissions are never automatically retried. Repeated reconciliation cannot authorise another uncertain confirmation POST. Known duplicate legacy records are held before claiming.
- Existing permission-checked recovery/reconciliation operations recognise V2 references; uncertain outcomes require reconciliation. No public recovery endpoint is opened. Public Printful creation/raw order retrieval, Revolut raw order lookup, fulfilment, recovery and import remain denied. Both checkout entry paths remain on `CHECKOUT_SECURITY_HOLD`.
- The responsive Vue checkout shows authoritative currency totals, FREE shipping, included tax, seller identity and accurate backend order states. It locks selection once payment starts, does not claim provider confirmation from a browser callback, and offers account-owned status lookup. Guest refresh loses the memory-only capability; recovery requires the original tab or a separately approved ownership-verification process.

Local validation:

| Check | Result |
| --- | --- |
| Commerce sandbox configuration | 136 passed; 27 environment/variant-specific skips; 0 failed |
| Commerce mocked production configuration | 137 passed; 1 fallback-only skip; 0 failed |
| Frontend currency, basket, capability and checkout tests | 15 passed; 0 failed |
| Independent application compatibility | 44 test files passed; 1 unchanged baseline failure |
| Infrastructure guard tests | 15 passed; 0 failed |
| Isolated CDK Commerce composition | Exactly nine opt-in resources; retained/protected ledger; exact scoped GetItem/PutItem policy; no Cognito/AppSync/KMS resources |
| Full Amplify TypeScript | Passed; final check recorded locally |
| Vue production build | Passed; existing bundle-size/dynamic-import warnings remain |
| Browser acceptance using only synthetic providers | GBP desktop; EUR/USD mobile; zero external requests, page errors or horizontal overflow |
| Actual generated-output contract check | FAIL, reproduced from untouched remote master: `readTeamHub` / `mutateTeamHub` missing from outputs |

The compatibility failure is `amplify/myFunction/shared/authoritativePermissions.test.ts`: it expects a different brand-administration denial message. It was reproduced using untouched remote-master sources. The current runtime and test were not altered to hide it. The output-contract failure was likewise reproduced against the baseline schema and outputs; no generated IDs or output metadata were manually repaired. These are unresolved integration gates, not waivers.

Original environment-boundary scenarios were restored against trusted stored-order/atomic fixtures rather than dropped. The Commerce harness now runs each file under `node --test`, propagating loading failures as nonzero exit codes.

Tests deny outbound fetch/HTTP/HTTPS/socket access and use mocked provider/data services. Browser checks block every non-localhost request. The demo is **not** certification against real Revolut sandbox or Printful contracts. No live payment, order, Lambda invocation or customer-data read occurred.

To exercise the isolated checkout, run `npm run checkout:demo`, open `http://127.0.0.1:5187/checkout-demo.html`, select GB and use postcode `TEST1`. It uses a standalone Vue entry and in-memory synthetic catalogue/payment/order data; it does not configure Amplify or point localhost at another AWS environment. The mock payment control is explicitly labelled. The standalone entry and mock controls are absent from the production build.

Useful local commands:

```text
npm run test:commerce
npm run test:commerce:production
node scripts/commerce/compatibility.mjs
node --test src/commerce/currencyPrices.test.mjs src/commerce/secureCheckout.test.mjs src/composables/useCheckout.test.mjs
node --import ./scripts/commerce/offline-guard.mjs --test scripts/validate-amplify-guards.test.mjs
npx tsc --noEmit -p amplify/tsconfig.json
npm run validate:amplify-contract
node scripts/commerce/baseline-check.mjs origin/master
```

Browser validation additionally requires an existing Playwright installation and Edge; `COMMERCE_PLAYWRIGHT_MODULE` can select an installed module without installing or changing recovery tooling. Production build validation used the unchanged generated API URL, synthetic public payment configuration and an inherited network guard. No outputs were repointed.

Infrastructure and release boundary:

- Logical owner: Commerce, within the existing LegacyPlatform runtime. This is completion of the existing reviewed module, not a new domain/root or Team Hub migration. Existing Cognito, AppSync and identity contracts remain authoritative. Customer addresses and capability hashes remain private ledger data; public order projections are allowlisted.
- Default added AWS resources: **zero**. The existing opt-in review composition remains nine resources: one DynamoDB table, one IAM policy, one HTTP integration, three routes and three Lambda permissions. Production branch names explicitly reject its activation. Nothing was deployed.
- The optional `currencyPrices` model field and mutation argument require an approved AppSync schema/introspection/output update before the administrator/storefront release uses them. This is a source change, not an assertion that production schema has changed. No migration or backfill is included.
- Public non-sensitive configuration uses reserved `GET /commerce/orders/config`, covered by the existing candidate order GET route; it does not add a fourth route. Production configuration reports checkout disabled and no enabled destinations.
- Existing production evidence identifies approximately 2,936 hierarchy resources and previously reviewed local assemblies around 2,628. These are historical baseline figures, **not a fresh full-root synthesis of this branch**. Do not deploy a full assembly or assume zero default resource growth proves production isolation. Full-root resource, IAM, resolver, environment, API-key and replacement comparison remains a deployment gate.
- Offline comparison with the verified production source map found all 64 unrelated bundled application modules unchanged after line-ending normalisation, with seven existing Commerce modules changed. This is static source evidence, not a new executable hash/dependency certification or live acceptance result.

Git safety: read-only AWS metadata confirmed account `058264289478`, region `eu-north-1`, profile `codex-master-oauth`. Amplify app `d2cux232bpa951` has master auto-build enabled and master is a production branch. Automatic branch creation and PR previews are disabled; this review branch was not connected. GitHub branch-protection inspection returned 403, so its rules were not assumed. No workflows directory was present in remote master. **Do not merge or push this work to master:** that can trigger deployment. Publish only the dedicated review branch and a draft PR; do not bypass protection or enable previews/workflows.

Unchanged pinned artifacts:

```text
Primary     0078b3ce83d36e3185a29f5d19f17d47322b67fd51cde27f7d11069c369bce86
Fallback    dd5ee45a7ad8edda619b71b23d72089d13a3294166e118c7b066994cc748eef3
Containment 267325a40e1a261614ef7b49b21ba1dca259075610d6d4c832b6af66cdaa1034
```

Remaining production requirements:

1. Resolve the verified baseline test/output-contract failures through their owning work, without sandbox replacement or unrelated recovery changes.
2. Obtain the seller's approved tax treatment, product classification, territorial/postcode coverage, rounding, effective dates and cross-border/import-charge responsibilities. Configure only cases that can actually be verified. An inclusive advertised price is not proof of zero tax liability. No production destination is currently enabled.
3. Approve and validate actual provider shipping, mapping, address normalisation, payment/refund and confirmation contracts in a separately authorised test environment. No credentials or provider settings were changed here. Runtime confirmation remains conservatively disabled pending that approval.
4. Configure product prices administratively after an approved schema/output release. Keep legacy orders immutable; do not reprice paid snapshots or infer new ownership from email.
5. Resolve the existing full-root consolidation/API-key/budget issues and approve a precise infrastructure plan before enabling the ledger/routes. Do not deploy the known 2,628-resource consolidation or activate the nine-resource candidate automatically.
6. Complete the controlled legacy cutover: reliable webhook preservation/recovery, old-execution drain, duplicate-record reconciliation and uncertain provider submission review. Known-duplicate detection is not a transactional uniqueness guarantee across concurrently created distinct legacy records. New quotes do not migrate those records.
7. Accept a rollback that understands any activated V2 orders and preserves ledger/claim/attempt evidence. The pinned security-only fallback remains valid for its assessed scope; it must not be assumed to service a subsequently activated V2 checkout. Never restore vulnerable or non-atomic code, clear uncertain claims or delete records to recover.
8. Obtain explicit deployment/production acceptance approval, then establish traffic/error/throttle monitoring and approved business acceptance checks. The production hold remains in place until all payable-total and operational gates pass. No live production vulnerability was remediated merely by committing this review branch.

Provider contract references reviewed: [Printful retail costs](https://developers.printful.com/docs/edm/) distinguishes tax/VAT not already included in retail prices; the inclusive adapter therefore avoids adding embedded tax twice. [Revolut refunds](https://developer.revolut.com/docs/guides/merchant/operations/refunds) describes related refund orders. [Merchant webhook guidance](https://developer.revolut.com/docs/guides/merchant/monitor-and-observe/webhooks/using-webhooks) describes finite retries; retryable errors alone are not durable delivery preservation.
