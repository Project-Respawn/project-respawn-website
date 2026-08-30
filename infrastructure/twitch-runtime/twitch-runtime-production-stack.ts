import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CfnOutput, CfnParameter, Duration, Stack, StackProps, Tags } from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export const PRODUCTION_RUNTIME = Object.freeze({
  account: '058264289478', region: 'eu-north-1', stack: 'ProjectRespawnTwitchRuntimeProduction',
  cluster: 'projectrespawn-twitchruntime-production', service: 'projectrespawn-twitchruntime-production',
  family: 'projectrespawn-twitchruntime-production', container: 'twitchruntime',
  logGroup: '/ecs/projectrespawn/twitchruntime/production',
  apiBase: 'https://g9eoo6e1h2.execute-api.eu-north-1.amazonaws.com',
  repository: 'projectrespawn/twitchruntime', metricNamespace: 'ProjectRespawn/TwitchRuntime',
});
const INFRA_DIR = path.dirname(fileURLToPath(import.meta.url));

export class TwitchRuntimeProductionStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    Tags.of(this).add('Project', 'ProjectRespawn'); Tags.of(this).add('Environment', 'production'); Tags.of(this).add('Component', 'TwitchRuntime');

    const imageUri = new CfnParameter(this, 'ImageUri', { type: 'String', allowedPattern: `^${PRODUCTION_RUNTIME.account}\\.dkr\\.ecr\\.${PRODUCTION_RUNTIME.region}\\.amazonaws\\.com/${PRODUCTION_RUNTIME.repository}@sha256:[a-f0-9]{64}$`, description: 'Immutable production ECR image URI including sha256 digest; latest and mutable tags are rejected.' });
    const integrationId = new CfnParameter(this, 'IntegrationId', { type: 'String', allowedPattern: '^[0-9a-fA-F-]{36}$', description: 'Independently verified CONNECTED MASTER TwitchIntegration ID.' });
    const runtimeSecretArn = new CfnParameter(this, 'RuntimeSecretArn', { type: 'String', allowedPattern: `^arn:aws:secretsmanager:${PRODUCTION_RUNTIME.region}:${PRODUCTION_RUNTIME.account}:secret:projectrespawn/production/twitchruntime/[A-Za-z0-9/_+=.@-]+$`, description: 'ARN of the pre-provisioned production runtime JSON secret.' });
    const heartbeatTable = new CfnParameter(this, 'HeartbeatTableName', { type: 'String', allowedPattern: '^TwitchRuntimeHealth-[A-Za-z0-9]+-NONE$', description: 'MASTER TwitchRuntimeHealth table name used only by the monitor Lambda.' });
    const twitchClientId = new CfnParameter(this, 'TwitchClientId', { type: 'String', minLength: 1, description: 'Production Twitch application client ID (configuration, not OAuth secret).' });
    const vpcId = new CfnParameter(this, 'VpcId', { type: 'AWS::EC2::VPC::Id' });
    const subnetIds = new CfnParameter(this, 'PublicSubnetIds', { type: 'List<AWS::EC2::Subnet::Id>', description: 'Production public subnets with outbound internet routing.' });

    const cluster = new ecs.CfnCluster(this, 'RuntimeCluster', { clusterName: PRODUCTION_RUNTIME.cluster, clusterSettings: [{ name: 'containerInsights', value: 'enabled' }] });
    const logGroup = new logs.CfnLogGroup(this, 'RuntimeLogGroup', { logGroupName: PRODUCTION_RUNTIME.logGroup, retentionInDays: 30 });
    const securityGroup = new ec2.CfnSecurityGroup(this, 'RuntimeSecurityGroup', { groupDescription: 'Project Respawn Twitch runtime production - outbound only', groupName: PRODUCTION_RUNTIME.cluster, vpcId: vpcId.valueAsString, securityGroupIngress: [], securityGroupEgress: [{ ipProtocol: '-1', cidrIp: '0.0.0.0/0' }] });
    const trust = { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'ecs-tasks.amazonaws.com' }, Action: 'sts:AssumeRole' }] };
    const taskRole = new iam.CfnRole(this, 'ApplicationTaskRole', { roleName: `${PRODUCTION_RUNTIME.cluster}-task`, assumeRolePolicyDocument: trust, description: 'Zero-permission application role; runtime uses the signed MASTER HTTPS API.' });
    const executionRole = new iam.CfnRole(this, 'ExecutionRole', {
      roleName: `${PRODUCTION_RUNTIME.cluster}-execution`, assumeRolePolicyDocument: trust,
      managedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy'],
      policies: [{ policyName: 'ReadExactProductionRuntimeSecret', policyDocument: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Action: 'secretsmanager:GetSecretValue', Resource: runtimeSecretArn.valueAsString }] } }],
    });
    const secret = (name: string) => ({ name, valueFrom: `${runtimeSecretArn.valueAsString}:${name}::` });
    const taskDefinition = new ecs.CfnTaskDefinition(this, 'RuntimeTaskDefinition', {
      family: PRODUCTION_RUNTIME.family, cpu: '256', memory: '512', networkMode: 'awsvpc', requiresCompatibilities: ['FARGATE'],
      runtimePlatform: { cpuArchitecture: 'X86_64', operatingSystemFamily: 'LINUX' }, executionRoleArn: executionRole.attrArn, taskRoleArn: taskRole.attrArn,
      containerDefinitions: [{
        name: PRODUCTION_RUNTIME.container, image: imageUri.valueAsString, essential: true, portMappings: [],
        environment: [
          { name: 'NODE_ENV', value: 'production' }, { name: 'PORT', value: '3000' },
          { name: 'RESPAWN_SECURE_RUNTIME_ENABLED', value: 'true' }, { name: 'RESPAWN_RUNTIME_API_BASE', value: PRODUCTION_RUNTIME.apiBase },
          { name: 'RESPAWN_RUNTIME_CLIENT_ID', value: 'respawn-twitch-bot-production' }, { name: 'RESPAWN_TWITCH_INTEGRATION_ID', value: integrationId.valueAsString },
          { name: 'RESPAWN_CANONICAL_ALERT_DELIVERY_ENABLED', value: 'false' }, { name: 'TWITCH_CLIENT_ID', value: twitchClientId.valueAsString },
          { name: 'TWITCH_ENABLE_HYPE_TRAIN', value: 'false' },
        ],
        secrets: [secret('RESPAWN_RUNTIME_SHARED_SECRET'), secret('TWITCH_CLIENT_SECRET'), secret('TWITCH_BOT_USERNAME'), secret('TWITCH_BOT_USER_ID'), secret('TWITCH_BOT_ACCESS_TOKEN'), secret('TWITCH_BOT_REFRESH_TOKEN'), secret('TWITCH_BOT_TOKEN_EXPIRES_AT')],
        healthCheck: { command: ['CMD-SHELL', `node -e \"fetch('http://127.0.0.1:3000/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))\"`], interval: 30, timeout: 5, retries: 3, startPeriod: 45 },
        stopTimeout: 30, logConfiguration: { logDriver: 'awslogs', options: { 'awslogs-group': PRODUCTION_RUNTIME.logGroup, 'awslogs-region': PRODUCTION_RUNTIME.region, 'awslogs-stream-prefix': 'production' } },
      }],
    });
    taskDefinition.addDependency(logGroup);
    const service = new ecs.CfnService(this, 'RuntimeService', {
      cluster: cluster.ref, serviceName: PRODUCTION_RUNTIME.service, desiredCount: 1, launchType: 'FARGATE', platformVersion: 'LATEST', taskDefinition: taskDefinition.ref,
      healthCheckGracePeriodSeconds: 60, deploymentConfiguration: { minimumHealthyPercent: 0, maximumPercent: 100, deploymentCircuitBreaker: { enable: true, rollback: true } },
      networkConfiguration: { awsvpcConfiguration: { assignPublicIp: 'ENABLED', securityGroups: [securityGroup.attrGroupId], subnets: subnetIds.valueAsList } },
    });

    const monitorLog = new logs.LogGroup(this, 'RuntimeMonitorLogGroup', { logGroupName: '/aws/lambda/projectrespawn-twitchruntime-production-monitor', retention: logs.RetentionDays.ONE_MONTH });
    const monitor = new lambda.Function(this, 'RuntimeMonitor', {
      functionName: 'projectrespawn-twitchruntime-production-monitor', runtime: lambda.Runtime.PYTHON_3_13, handler: 'index.handler', code: lambda.Code.fromAsset(path.join(INFRA_DIR, 'production-monitor')),
      timeout: Duration.seconds(20), memorySize: 128, logGroup: monitorLog,
      environment: { CLUSTER_NAME: PRODUCTION_RUNTIME.cluster, SERVICE_NAME: PRODUCTION_RUNTIME.service, HEARTBEAT_TABLE_NAME: heartbeatTable.valueAsString, INTEGRATION_ID: integrationId.valueAsString, ENVIRONMENT: 'production' },
    });
    monitor.addToRolePolicy(new iam.PolicyStatement({ actions: ['ecs:DescribeServices'], resources: ['*'] }));
    monitor.addToRolePolicy(new iam.PolicyStatement({ actions: ['dynamodb:GetItem'], resources: [`arn:aws:dynamodb:${PRODUCTION_RUNTIME.region}:${PRODUCTION_RUNTIME.account}:table/${heartbeatTable.valueAsString}`] }));
    monitor.addToRolePolicy(new iam.PolicyStatement({ actions: ['cloudwatch:PutMetricData'], resources: ['*'] }));
    new events.Rule(this, 'ScheduledHealthCheck', { ruleName: 'projectrespawn-twitchruntime-production-health-check', schedule: events.Schedule.rate(Duration.minutes(1)), targets: [new targets.LambdaFunction(monitor)] });
    new events.Rule(this, 'TaskStoppedEvents', { ruleName: 'projectrespawn-twitchruntime-production-task-stopped', eventPattern: { source: ['aws.ecs'], detailType: ['ECS Task State Change'], detail: { clusterArn: [`arn:aws:ecs:${PRODUCTION_RUNTIME.region}:${PRODUCTION_RUNTIME.account}:cluster/${PRODUCTION_RUNTIME.cluster}`], group: [`service:${PRODUCTION_RUNTIME.service}`], lastStatus: ['STOPPED'] } }, targets: [new targets.LambdaFunction(monitor)] });
    const dimensions = { Environment: 'production', Service: PRODUCTION_RUNTIME.service };
    new cloudwatch.Alarm(this, 'ServiceUnavailableAlarm', { alarmName: 'projectrespawn-twitchruntime-production-service-unavailable', metric: new cloudwatch.Metric({ namespace: PRODUCTION_RUNTIME.metricNamespace, metricName: 'RunningTaskCount', dimensionsMap: dimensions, statistic: 'Minimum', period: Duration.minutes(1) }), threshold: 1, comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD, evaluationPeriods: 2, datapointsToAlarm: 2, treatMissingData: cloudwatch.TreatMissingData.BREACHING });
    new cloudwatch.Alarm(this, 'RepeatedTaskExitsAlarm', { alarmName: 'projectrespawn-twitchruntime-production-repeated-task-exits', metric: new cloudwatch.Metric({ namespace: PRODUCTION_RUNTIME.metricNamespace, metricName: 'TaskExitCount', dimensionsMap: dimensions, statistic: 'Sum', period: Duration.minutes(10) }), threshold: 3, comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD, evaluationPeriods: 1, treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING });
    new cloudwatch.Alarm(this, 'StaleHeartbeatAlarm', { alarmName: 'projectrespawn-twitchruntime-production-heartbeat-stale', metric: new cloudwatch.Metric({ namespace: PRODUCTION_RUNTIME.metricNamespace, metricName: 'HeartbeatAgeSeconds', dimensionsMap: dimensions, statistic: 'Maximum', period: Duration.minutes(1) }), threshold: 300, comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD, evaluationPeriods: 2, datapointsToAlarm: 2, treatMissingData: cloudwatch.TreatMissingData.BREACHING });

    new CfnOutput(this, 'ClusterName', { value: cluster.ref }); new CfnOutput(this, 'ServiceName', { value: service.attrName });
    new CfnOutput(this, 'CanonicalDeliveryInitialState', { value: 'false' });
  }
}
