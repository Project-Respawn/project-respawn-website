# Twitch runtime production infrastructure

`ProjectRespawnTwitchRuntimeProduction` owns one production Fargate cluster, service, task definition, roles, outbound-only security group, log groups, monitor Lambda, EventBridge rules, and alarms. It is separate from Amplify and from the manually provisioned Technical Alpha runtime.

The service uses public subnets and a public IPv4 address for outbound Twitch, MASTER HTTPS API, ECR, logging, and Secrets Manager access. It has no ingress, listener, load balancer, or NAT Gateway. This is the smallest current design; moving to private subnets would add NAT or VPC endpoint cost without reducing public inbound exposure because the security group has no ingress.

The application task role has no AWS permissions. The execution role uses the standard ECS execution policy and may read only the supplied `projectrespawn/production/twitchruntime/...` secret. Broadcaster tokens are leased through the MASTER runtime API and never enter the task definition or secret. Bot-account chat credentials and the Twitch application secret are distinct from broadcaster OAuth tokens and occupy JSON keys in that single secret.

The image input must be `058264289478.dkr.ecr.eu-north-1.amazonaws.com/projectrespawn/twitchruntime@sha256:<digest>`. Release flow: record source commit, build once, push an immutable version tag, record its digest, review CDK diff with that digest, then deploy the resulting task-definition revision. `latest` is rejected.

Deployments use `minimumHealthyPercent=0` and `maximumPercent=100`, deliberately stopping the old task before starting the new one. Expect brief EventSub disconnect/reconnect downtime. The ECS circuit breaker rolls back failed steady-state deployments. Record the previous task-definition ARN, digest, parameter set, and secret ARN with every release; rollback is a CDK redeploy of those recorded inputs.

`RESPAWN_CANONICAL_ALERT_DELIVERY_ENABLED=false` is embedded explicitly. Enabling it requires reviewed source/IaC change and a new task-definition revision.

Use `npm run iac:twitch:production:synth` and `npm run iac:twitch:production:diff` with all required `TWITCH_RUNTIME_*` inputs. Only after the Phase 2A backend, secret, image digest, and CONNECTED MASTER integration are independently approved should `npm run iac:twitch:production:deploy` be used.

The monitor runs once per minute and emits running-task count and heartbeat age; task-stop events emit exit count. Three alarms cover unavailable service, repeated exits, and a heartbeat older than five minutes. They intentionally have no notification destination until an approved production destination exists.

Runtime environment inventory:

| Name | Purpose | Source | Secret | Production source |
|---|---|---|---|---|
| `NODE_ENV`, `PORT` | Node runtime and local health port | IaC | No | Fixed production values |
| `RESPAWN_SECURE_RUNTIME_ENABLED` | Fail-closed signed runtime mode | IaC | No | `true` |
| `RESPAWN_RUNTIME_API_BASE` | Signed control-plane API | IaC | No | Exact MASTER API |
| `RESPAWN_RUNTIME_CLIENT_ID` | Signature client identity | IaC | No | Fixed production identity |
| `RESPAWN_RUNTIME_SHARED_SECRET` | HMAC credential | Secrets Manager | Yes | Exact production secret JSON key |
| `RESPAWN_TWITCH_INTEGRATION_ID` | Single integration selection | deployment parameter | No | Verified MASTER integration |
| `RESPAWN_CANONICAL_ALERT_DELIVERY_ENABLED` | Canonical delivery gate | IaC | No | Explicit `false` |
| `TWITCH_CLIENT_ID` | Twitch application identity | deployment parameter | No | Approved production Twitch app |
| `TWITCH_CLIENT_SECRET` | Twitch application credential | Secrets Manager | Yes | Production secret JSON key |
| `TWITCH_BOT_USERNAME`, `TWITCH_BOT_USER_ID` | Chat bot identity | Secrets Manager | Configuration | Production secret JSON keys |
| `TWITCH_BOT_ACCESS_TOKEN`, `TWITCH_BOT_REFRESH_TOKEN`, `TWITCH_BOT_TOKEN_EXPIRES_AT` | Bot-account chat session | Secrets Manager | Yes | Production secret JSON keys; never broadcaster tokens |
| `TWITCH_ENABLE_HYPE_TRAIN` | Unsupported subscription gate | IaC | No | `false` |
