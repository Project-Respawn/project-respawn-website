# MASTER backend deployment preview

`npm run preview:master-backend` is the required deployment-free safety check before a Project Respawn MASTER Amplify backend deployment.

It performs two separate operations:

1. Synthesizes the complete Amplify backend locally into `.amplify/master-preview/cdk.out` using the same backend entry point and MASTER branch context as the Amplify deployment flow.
2. Uses read-only AWS CLI calls to verify the account, Amplify app, production branch, root stack, and overlay outputs, then compares the synthesized root and every reachable nested template with the templates currently deployed in CloudFormation.

The command never calls `ampx pipeline-deploy`, `ampx sandbox`, `cdk deploy`, CloudFormation change-set creation/execution, or an AWS write API. A successful preview is not a deployment.

## Commands

```text
npm run test:master-backend-preview
npm run synth:master-backend
npm run preview:master-backend
```

The preview exits with code `0` only for `SAFE TO DEPLOY`; `BLOCKED` exits nonzero. Missing credentials, incomplete stack traversal, identity/output mismatches, no material change, or any unapproved material change all fail closed.

## Phase 1 policy

The deliberately narrow Phase 1 allowlist permits only `Properties.Code` changes on `OverlaySourceOverlaySourceFunctionC8484D26` in the MASTER overlay-source nested stack. It does not permit environment, IAM, API, Cognito, DynamoDB, AppSync, storage, resource additions/removals, or other Lambda asset changes.

CloudFormation metadata and nested-stack `TemplateURL` publication locations are normalized because each nested template is compared directly. Other properties are not discarded. A changed Lambda `Code.S3Key` remains blocking unless it is the allowlisted overlay asset or the guard downloads the deployed archive and proves identical file lists, byte-identical executable files, and source maps that differ only by CRLF/LF inside embedded source text. Any executable, dependency, generated-source, file-list, or other source-map difference remains blocking.

The generated AppSync default API-key expiry is accepted only when `Properties.Expires` is the sole resource difference, moves forward, and is 29–31 days from synthesis. `ApiId`, authorization configuration, key removal/replacement, schema changes, or any other AppSync difference remains blocking. AWS documents an `Expires` update as requiring no interruption.

## Fixed production identity

The guard requires account `058264289478`, region `eu-north-1`, Amplify app `d2cux232bpa951`, branch `master`, and root stack `amplify-d2cux232bpa951-master-branch-53ef67772a`. It also validates the production overlay HTTP/WebSocket outputs and rejects known sandbox API identifiers. `Ntgrestage8` is never a preview target.

Review the complete report even when the verdict is safe. The guard authorizes nothing and performs no follow-on deployment automatically.
