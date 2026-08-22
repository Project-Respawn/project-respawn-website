import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CfnCondition,
  CfnOutput,
  CfnParameter,
  Duration,
  Fn,
  Stack,
  StackProps,
  Tags,
} from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

const ACCOUNT = '058264289478';
const REGION = 'eu-north-1';
const CLUSTER_NAME = 'projectrespawn-twitchruntime-staging';
const SERVICE_NAME = 'twitchruntime-0-0-1-alpha';
const TASK_FAMILY = 'projectrespawn-twitchruntime-staging';
const SECRET_NAME = 'projectrespawn/staging/twitchruntime/0.0.1-alpha';
const IMAGE = `${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/projectrespawn/twitchruntime@sha256:a979cec5aeebaa10442686cead279ffc4b81e78f824427a9bc1db1374419695b`;
const METRIC_NAMESPACE = 'ProjectRespawn/TwitchRuntime';
const INFRA_DIR = path.dirname(fileURLToPath(import.meta.url));

export class TwitchRuntimeStagingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    Tags.of(this).add('Project', 'ProjectRespawn');
    Tags.of(this).add('Environment', 'Ntgrestage8');
    Tags.of(this).add('Component', 'TwitchRuntime');

    const heartbeatTable = new CfnParameter(this, 'HeartbeatTableName', {
      type: 'String',
      description: 'Dynamically resolved Ntgrestage8 TwitchRuntimeHealth DynamoDB table name',
    });
    const integrationId = new CfnParameter(this, 'IntegrationId', {
      type: 'String',
      default: '8e548416-206d-44ea-a42a-5353c2fac86c',
    });
    const manageRuntime = new CfnParameter(this, 'ManageRuntimeResources', {
      type: 'String',
      allowedValues: ['false', 'true'],
      default: 'false',
      description: 'Keep false for the existing staging service. True is only for an explicitly reviewed clean-environment deployment.',
    });
    const createRuntime = new CfnCondition(this, 'CreateRuntimeResources', {
      expression: Fn.conditionEquals(manageRuntime.valueAsString, 'true'),
    });

    this.defineReproducibleRuntime(createRuntime);
    this.defineMonitoring(heartbeatTable.valueAsString, integrationId.valueAsString);

    new CfnOutput(this, 'RuntimeOwnership', {
      value: Fn.conditionIf(createRuntime.logicalId, 'CREATED_BY_THIS_STACK', 'EXISTING_RESOURCES_REFERENCED').toString(),
    });
  }

  private defineReproducibleRuntime(condition: CfnCondition) {
    const vpcId = new CfnParameter(this, 'VpcId', { type: 'AWS::EC2::VPC::Id', default: 'vpc-01d760d856a935f23' });
    const subnetIds = new CfnParameter(this, 'PublicSubnetIds', {
      type: 'List<AWS::EC2::Subnet::Id>',
      default: 'subnet-027c7b2cca6b38427,subnet-0f1c0f3c2791d3038,subnet-076a5e1e725cb85a3',
    });

    const cluster = new ecs.CfnCluster(this, 'RuntimeCluster', { clusterName: CLUSTER_NAME });
    cluster.cfnOptions.condition = condition;

    const logGroup = new logs.CfnLogGroup(this, 'RuntimeLogGroup', {
      logGroupName: '/ecs/projectrespawn/twitchruntime/staging',
      retentionInDays: 14,
    });
    logGroup.cfnOptions.condition = condition;

    const securityGroup = new ec2.CfnSecurityGroup(this, 'RuntimeSecurityGroup', {
      groupDescription: 'Project Respawn Twitch runtime staging - outbound only',
      groupName: CLUSTER_NAME,
      vpcId: vpcId.valueAsString,
      securityGroupIngress: [],
      securityGroupEgress: [{ ipProtocol: '-1', cidrIp: '0.0.0.0/0' }],
    });
    securityGroup.cfnOptions.condition = condition;

    const taskRole = new iam.CfnRole(this, 'ApplicationTaskRole', {
      roleName: `${CLUSTER_NAME}-task`,
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Principal: { Service: 'ecs-tasks.amazonaws.com' }, Action: 'sts:AssumeRole' }],
      },
      description: 'Zero-permission application role for the Twitch staging runtime',
    });
    taskRole.cfnOptions.condition = condition;

    const secretArn = `arn:aws:secretsmanager:${REGION}:${ACCOUNT}:secret:${SECRET_NAME}-*`;
    const executionRole = new iam.CfnRole(this, 'ExecutionRole', {
      roleName: `${CLUSTER_NAME}-execution`,
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Principal: { Service: 'ecs-tasks.amazonaws.com' }, Action: 'sts:AssumeRole' }],
      },
      managedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy'],
      policies: [{
        policyName: 'ReadRuntimeSecret',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Action: 'secretsmanager:GetSecretValue', Resource: secretArn }],
        },
      }],
    });
    executionRole.cfnOptions.condition = condition;

    const secret = (key: string) => ({
      name: key,
      valueFrom: `arn:aws:secretsmanager:${REGION}:${ACCOUNT}:secret:${SECRET_NAME}:${key}::`,
    });
    const taskDefinition = new ecs.CfnTaskDefinition(this, 'RuntimeTaskDefinition', {
      family: TASK_FAMILY,
      cpu: '256',
      memory: '512',
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      runtimePlatform: { cpuArchitecture: 'X86_64', operatingSystemFamily: 'LINUX' },
      executionRoleArn: executionRole.attrArn,
      taskRoleArn: taskRole.attrArn,
      containerDefinitions: [{
        name: 'twitchruntime',
        image: IMAGE,
        essential: true,
        portMappings: [],
        environment: [
          { name: 'NODE_ENV', value: 'production' },
          { name: 'PORT', value: '3000' },
          { name: 'RESPAWN_SECURE_RUNTIME_ENABLED', value: 'true' },
          { name: 'RESPAWN_RUNTIME_API_BASE', value: 'https://9qp7ehd406.execute-api.eu-north-1.amazonaws.com' },
          { name: 'RESPAWN_RUNTIME_CLIENT_ID', value: 'respawn-twitch-bot' },
          { name: 'RESPAWN_TWITCH_INTEGRATION_ID', value: '8e548416-206d-44ea-a42a-5353c2fac86c' },
          { name: 'TWITCH_ENABLE_HYPE_TRAIN', value: 'false' },
        ],
        secrets: [
          secret('RESPAWN_RUNTIME_SHARED_SECRET'), secret('TWITCH_CLIENT_ID'), secret('TWITCH_CLIENT_SECRET'),
          secret('TWITCH_BOT_USERNAME'), secret('TWITCH_BOT_USER_ID'), secret('TWITCH_BOT_ACCESS_TOKEN'),
          secret('TWITCH_BOT_TOKEN_EXPIRES_AT'),
        ],
        healthCheck: {
          command: ['CMD-SHELL', `node -e \"fetch('http://127.0.0.1:3000/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))\"`],
          interval: 30,
          timeout: 5,
          retries: 3,
          startPeriod: 45,
        },
        stopTimeout: 30,
        logConfiguration: {
          logDriver: 'awslogs',
          options: {
            'awslogs-group': '/ecs/projectrespawn/twitchruntime/staging',
            'awslogs-region': REGION,
            'awslogs-stream-prefix': '0.0.1-alpha',
          },
        },
      }],
      tags: [{ key: 'Version', value: '0.0.1-alpha' }],
    });
    taskDefinition.cfnOptions.condition = condition;

    const service = new ecs.CfnService(this, 'RuntimeService', {
      cluster: cluster.ref,
      serviceName: SERVICE_NAME,
      desiredCount: 1,
      launchType: 'FARGATE',
      platformVersion: 'LATEST',
      taskDefinition: taskDefinition.ref,
      healthCheckGracePeriodSeconds: 60,
      deploymentConfiguration: { minimumHealthyPercent: 0, maximumPercent: 100 },
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          securityGroups: [securityGroup.attrGroupId],
          subnets: subnetIds.valueAsList,
        },
      },
    });
    service.cfnOptions.condition = condition;
  }

  private defineMonitoring(heartbeatTableName: string, integrationId: string) {
    const topic = new sns.Topic(this, 'OperationalAlertsTopic', {
      topicName: 'projectrespawn-twitchruntime-staging-operational-alerts',
      displayName: 'Project Respawn Twitch staging operational alerts',
    });

    const monitorLogGroup = new logs.LogGroup(this, 'RuntimeMonitorLogGroup', {
      logGroupName: '/aws/lambda/projectrespawn-twitchruntime-staging-monitor',
      retention: logs.RetentionDays.TWO_WEEKS,
    });
    const monitor = new lambda.Function(this, 'RuntimeMonitor', {
      functionName: 'projectrespawn-twitchruntime-staging-monitor',
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(INFRA_DIR, 'monitor')),
      timeout: Duration.seconds(20),
      memorySize: 128,
      logGroup: monitorLogGroup,
      environment: {
        CLUSTER_NAME,
        SERVICE_NAME,
        HEARTBEAT_TABLE_NAME: heartbeatTableName,
        INTEGRATION_ID: integrationId,
      },
    });
    monitor.addToRolePolicy(new iam.PolicyStatement({ actions: ['ecs:DescribeServices'], resources: ['*'] }));
    monitor.addToRolePolicy(new iam.PolicyStatement({
      actions: ['dynamodb:GetItem'],
      resources: [`arn:aws:dynamodb:${REGION}:${ACCOUNT}:table/${heartbeatTableName}`],
    }));
    monitor.addToRolePolicy(new iam.PolicyStatement({ actions: ['cloudwatch:PutMetricData'], resources: ['*'] }));

    new events.Rule(this, 'ScheduledHealthCheck', {
      ruleName: 'projectrespawn-twitchruntime-staging-health-check',
      schedule: events.Schedule.rate(Duration.minutes(1)),
      targets: [new targets.LambdaFunction(monitor)],
    });
    new events.Rule(this, 'TaskStoppedEvents', {
      ruleName: 'projectrespawn-twitchruntime-staging-task-stopped',
      eventPattern: {
        source: ['aws.ecs'],
        detailType: ['ECS Task State Change'],
        detail: {
          clusterArn: [`arn:aws:ecs:${REGION}:${ACCOUNT}:cluster/${CLUSTER_NAME}`],
          group: [`service:${SERVICE_NAME}`],
          lastStatus: ['STOPPED'],
        },
      },
      targets: [new targets.LambdaFunction(monitor)],
    });

    const dimensions = { Environment: 'Ntgrestage8', Service: SERVICE_NAME };
    const alarms = [
      new cloudwatch.Alarm(this, 'ServiceUnavailableAlarm', {
        alarmName: 'projectrespawn-twitchruntime-staging-service-unavailable',
        alarmDescription: 'The Twitch staging service cannot maintain its desired count of one.',
        metric: new cloudwatch.Metric({ namespace: METRIC_NAMESPACE, metricName: 'RunningTaskCount', dimensionsMap: dimensions, statistic: 'Minimum', period: Duration.minutes(1) }),
        threshold: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        evaluationPeriods: 2,
        datapointsToAlarm: 2,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
      }),
      new cloudwatch.Alarm(this, 'RepeatedTaskExitsAlarm', {
        alarmName: 'projectrespawn-twitchruntime-staging-repeated-task-exits',
        alarmDescription: 'Three or more stopped service tasks in ten minutes indicates an unhealthy replacement loop.',
        metric: new cloudwatch.Metric({ namespace: METRIC_NAMESPACE, metricName: 'TaskExitCount', dimensionsMap: dimensions, statistic: 'Sum', period: Duration.minutes(10) }),
        threshold: 3,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        evaluationPeriods: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }),
      new cloudwatch.Alarm(this, 'StaleHeartbeatAlarm', {
        alarmName: 'projectrespawn-twitchruntime-staging-heartbeat-stale',
        alarmDescription: 'The latest valid Twitch runtime heartbeat is more than five minutes old.',
        metric: new cloudwatch.Metric({ namespace: METRIC_NAMESPACE, metricName: 'HeartbeatAgeSeconds', dimensionsMap: dimensions, statistic: 'Maximum', period: Duration.minutes(1) }),
        threshold: 300,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        evaluationPeriods: 2,
        datapointsToAlarm: 2,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
      }),
    ];
    for (const alarm of alarms) alarm.addAlarmAction(new actions.SnsAction(topic));

    new CfnOutput(this, 'OperationalAlertsTopicArn', { value: topic.topicArn });
  }
}
