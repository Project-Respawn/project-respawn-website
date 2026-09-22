# AWS naming and environment identity

Status: proposed standard for future resources. No existing physical resource is renamed.

## Three independent kinds of name

| Name kind | Standard | Safety |
| --- | --- | --- |
| Logical product/deployment label | `ProjectRespawn / Esports / TeamHub / production` in docs, ownership registry, dashboards | Safe documentation change; supported resource tags still require a reviewed deployment |
| Future root stack name | `ProjectRespawn-Esports-TeamHub-production` | Set once at creation; changing an existing stack's name means a different stack |
| Construct ID/path | Stable domain ID such as `TeamHubApi`, with explicit compatibility mapping | CDK uses path in logical IDs; moving/renaming a construct may replace resources even if code is equivalent |
| Physical name | Prefer generated identifiers for existing/stateful resources; explicit names only when operationally necessary | Bucket/table/pool/key/function names can impose replacement, uniqueness and length constraints |

For newly created explicit physical names, use lower-case service-compatible slugs such as `pr-production-esports-teamhub-api`, shortened per service limit. S3 requires global uniqueness; add account/region and a deterministic unique suffix if an explicit name is truly needed. Do not force one naming string across all AWS services. Use aliases/descriptions/tags for console readability where supported. KMS alias naming does not authorize replacement of its key.

Suggested tags: `Project=ProjectRespawn`, `Domain=Esports`, `Module=TeamHub`, `Environment=production`, `Owner=<responsible-team>`, `ManagedBy=CDK`, `DataClassification=<classification>`, `DeploymentUnit=<stable-id>`, `Repository=<repo-id>`. Avoid personal data/secrets in names or tags. Apply tags only to supported resource types and inspect deployment changes.

## Environment registry

Use a versioned registry mapping account, region, Amplify app/branch, root ARN, logical environment and contract outputs. Resolve generated physical IDs from authoritative outputs; never guess from a name prefix or overwrite amplify_outputs.json by hand.

Observed mappings: `master` -> production; `staging` -> staging; `Demo` -> demo; `Ntgre` -> this workstation's current sandbox; Daniel and legacy Ntgrestage8 are separate stacks. `development` is the Git working branch but its historical AWS branch root is ROLLBACK_COMPLETE and is not an active hosted website branch. Preserve case in actual branch/sandbox identifiers. A proposed display slug such as `sandbox-ntgre` is not permission to change the Amplify identifier.

`ProjectRespawnTwitchRuntimeStaging` has a conflicting Environment tag `Ntgrestage8`; record both until its ownership is resolved. `swg-private-test` is an adjacent infrastructure root, not automatically the website SWG tool backend. Companion has separate hosting and unknown backend ownership.

Suggested new configuration contract path: `/project-respawn/<environment>/<domain>/<module>/v1/<setting>`. Include issuer, allowed audiences, endpoint, contract version, account/region, publishing deployment revision and readiness. Keep secrets in an appropriate secret store, never in a frontend manifest. Only safe public configuration belongs in the browser.

## Existing-resource rule

Do not rename current `amplify-*` roots, model stacks, bucket names, Cognito pools, AppSync APIs, table names or KMS keys for cosmetics. Source folder refactoring must preserve deployed construct paths/logical IDs and produce a template diff proving it. A stateful ownership transfer is a migration project with physical-ID checks, not a naming cleanup. See [CDK best practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html).
