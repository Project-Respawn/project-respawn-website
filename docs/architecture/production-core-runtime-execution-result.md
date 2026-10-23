# Project Respawn ? production Core runtime KMS result

**PRODUCTION CORE RUNTIME RECOVERY BLOCKED ? CUSTOM METRIC EXTRACTION.**

The approved runtime KMS correction was deployed successfully. Actual Lambda initialization and runtime Decrypt succeeded; production Core is not fully accepted because the mandatory application-monitoring gate failed. No automatic invocation retry, additional permission change or runtime/logging patch was attempted.

[Consolidated actual result](production-core-runtime-execution-2026-10-21/result.json) ? [monitoring failure and correlated logs](production-core-runtime-execution-2026-10-21/monitoring-gate-result.json) ? [post-preservation](production-core-runtime-execution-2026-10-21/post-preservation.json).

## Authorization and pins

Current explicit user authorization plus the fresh ?Yes?available now; no concurrent changes? confirmation were recorded accurately. [Window receipt](production-core-runtime-execution-2026-10-21/authorization-window.json): 2026-10-21T14:42:17.877Z to 2026-10-21T16:42:17.877Z. This is a new window, not inferred historical attendance. Core only; no Team, authority, source migration or Master scope.

Manifest: `bf0b925d859e98ce160b4de53ab9ccca5c9f73285ea6bfa46f733da5e071de0c`. Security: `8f83dda21a47895b2f48cea19839daa84bdbcba7f28ff82e30906aec595b0c44`. Product: `0302056f0152107ecabd9d459ab50d436245587eef3cec1aa4d971c77a6ca1e4`. Unchanged ZIP: `fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503`. All exact artifact, rollback, source and evidence bindings verified before execution and again afterward. Only the two reviewed templates were published with checksum/download verification. The runtime object was reused.

## Actual AWS execution

| Gate | Actual result |
| --- | --- |
| Fresh identity/account/region | RavenTest, 058264289478, eu-north-1 |
| Source protection/data | 1 Team, 8 memberships, 11 roster slots, 101 champion entries; exact digests; four backups AVAILABLE; PITR/deletion protection intact |
| Imported log | IN_SYNC before and after; retained unchanged |
| Security change set | Exactly five reviewed Modify, no Add/Delete/Replace |
| Security execution | UPDATE_COMPLETE; rollback explicitly enabled |
| Installed security | All six resources, policies, boundaries, trusts and artifact restrictions match |
| Actual execution-role controls | 119 passed |
| Product change set | Exactly Runtime Policies Modify; no Lambda or log changes |
| Product execution | UPDATE_COMPLETE; rollback explicitly enabled |
| Actual runtime-role controls | 50 passed |
| ZIP/environment | Exact unchanged pinned bytes/configuration; Active/Successful |
| Controlled invocation | One attempt, request d427e306-cbeb-4425-a8d6-9b3be19b5bbe; expected UNAUTHENTICATED, no FunctionError |
| Actual KMS evidence | 2 successful Core runtime Decrypt CloudTrail events; sanitized receipts preserved |
| Resource accounting | Six security + seven product = thirteen, unchanged |

Complete inspected AWS change sets and execution receipts are retained in the evidence directory; the product change targets only the role?s Policies property and RequiresRecreation Never.

## Mandatory monitoring failure

The controlled request has native Invocations=1, Errors=0, Throttles=0 and a correlated platform.report status success. JSON application logs contain a nested EMF payload with Environment Production, Requests 1, Denied 1 and zero dependency/rate-limit failures. However, the four custom metric queries return no points; expected Denied at least 1, observed 0. Four alarms remain OK, which does not establish their underlying signal works.

Lambda JSON logging puts the EMF object inside the message field rather than at the event root. [AWS?s Node.js logging documentation](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-logging.html) describes this console/JSON incompatibility and direct stdout emission as a supported remedy. This report proposes no automatic remedy: a runtime-emission or logging-configuration candidate needs separate review and authorization. The earlier collector also expected text platform lines and root EMF; the sanitized envelope inspection distinguishes that collection limitation from the independently confirmed absence of CloudWatch custom counters. No fake PutMetricData or weakened monitoring criterion was used.

## Authentication and cleanup

The isolated localhost helper started after successful initialization and Ntgre local-output validation. No completed Admin, ordinary-user or valid signed Ntgre rejection receipts were captured. The user requested automation; browser process metadata showed no existing debugging connection. No profile/password/cookie database was inspected. Further session reuse and authentication invocations were stopped at the mandatory monitoring failure. Only the owned helper PID 19292 was stopped, clearing its in-memory state. No credentials or tokens were persisted.

## Preservation and next gate

All production source counts/digests/relationships, four backups, PITR/deletion protection, production Cognito, Master and protected stacks were independently reverified after deployment. No source data changed. No Team stack, authority row, migration, fence, frontend publication or retirement occurred. No rollback was performed: the deployed KMS correction initializes successfully; automatic restoration of the previously unhealthy policy was not appropriate.

Next: prepare and separately authorize the smallest custom-metric emission correction, preserve these installed IAM pins and ZIP history, prove actual extracted counters and alarm signal behavior, then complete the existing production Admin/ordinary/valid-Ntgre-rejection contracts. Team deployment remains separately gated on complete Core acceptance.
