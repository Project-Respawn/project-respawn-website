# Twitch runtime staging infrastructure

This CDK stack captures the proven Technical Alpha ECS architecture and deploys only its minimal monitoring by default. AWS CDK was selected because this repository already uses `aws-cdk-lib`; no second infrastructure framework is introduced.

## Ownership and safe deployment

The healthy ECS cluster, service, task definition, roles, log group, security group, ECR repository, secret, VPC, and public subnets predate this stack. `ManageRuntimeResources=false` is the mandatory setting for the current staging account, so CloudFormation references but does not import, replace, or update them. The conditional ECS resources are a reproducible clean-environment definition. Enabling them in the current account would collide with existing names and is prohibited without a separate reviewed adoption plan.

Run `npm run iac:twitch:staging:diff` before every deployment. The wrapper verifies AWS account `058264289478`, dynamically resolves the single generated `TwitchRuntimeHealth-*` table, and forces `ManageRuntimeResources=false`. Stop if a plan shows deletion/replacement, runtime ECS changes, an ALB, a NAT Gateway, desired count other than one, or any production resource.

After reviewing the diff, run `npm run iac:twitch:staging:deploy`.

## Represented ECS architecture

- One Fargate on-demand service and task: 0.25 vCPU, 512 MiB, desired count one.
- Public subnets with public IPv4; outbound-only security group and no ingress.
- No load balancer and no NAT Gateway.
- Empty application task role; execution role can pull the image, write logs, and read only the runtime secret.
- Fourteen-day log retention and the pinned `0.0.1-alpha` ECR digest.
- Container `/healthz` check and stop-before-start deployment (`minimumHealthyPercent=0`, `maximumPercent=100`).
- Secrets Manager JSON-key injection. No broadcaster credential or Twitch refresh token is added to the reproducible task definition.

## Monitoring

A 128 MiB scheduled Lambda runs once per minute outside the ECS task role. It reads only the relevant heartbeat item and calls `ecs:DescribeServices`, then publishes `RunningTaskCount` and `HeartbeatAgeSeconds`. An EventBridge ECS task-state rule sends stopped tasks to the same function to publish `TaskExitCount`.

Three alarms publish to `projectrespawn-twitchruntime-staging-operational-alerts`:

- running count below one for two minutes;
- at least three task exits in ten minutes;
- heartbeat age above five minutes for two consecutive checks (effective alert after roughly six minutes, avoiding one missed heartbeat).

Missing service/heartbeat metrics are treated as failures. No SNS subscription is created; an email, HTTPS, or other approved subscription is still required for delivery outside AWS.

## Safe alarm validation

Do not stop the Twitch service to test alarms. Use `aws cloudwatch set-alarm-state` on each alarm to confirm its SNS action path, then return it to normal metric evaluation with a harmless metric publication or wait for the next scheduled sample. Confirm the SNS topic remains unsubscribed unless an approved destination has been configured.
