import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ITable, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { CorsHttpMethod, HttpApi, HttpMethod, WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration, WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { join } from 'node:path';

export interface OverlaySourceInfrastructureProps {
  workspaceTable: ITable;
  brandTable: ITable;
  userPoolId: string;
  userPoolClientId: string;
  frontendOrigin: string;
  handlerEntry?: string;
}

export class OverlaySourceInfrastructure extends Construct {
  readonly publicationTable: Table;
  readonly connectionTable: Table;
  readonly handler: NodejsFunction;
  readonly httpUrl: string;
  readonly websocketUrl: string;

  constructor(scope: Construct, id: string, props: OverlaySourceInfrastructureProps) {
    super(scope, id);
    const stack = Stack.of(this);
    this.publicationTable = new Table(this, 'OverlayPublication', { partitionKey: { name: 'publicationId', type: AttributeType.STRING }, billingMode: BillingMode.PAY_PER_REQUEST, pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, removalPolicy: RemovalPolicy.RETAIN });
    this.publicationTable.addGlobalSecondaryIndex({ indexName: 'credentialHash-index', partitionKey: { name: 'credentialHash', type: AttributeType.STRING }, projectionType: ProjectionType.ALL });
    this.connectionTable = new Table(this, 'OverlaySourceConnection', { partitionKey: { name: 'connectionId', type: AttributeType.STRING }, billingMode: BillingMode.PAY_PER_REQUEST, timeToLiveAttribute: 'expiresAtEpoch', removalPolicy: RemovalPolicy.DESTROY });
    this.connectionTable.addGlobalSecondaryIndex({ indexName: 'publicationId-index', partitionKey: { name: 'publicationId', type: AttributeType.STRING }, projectionType: ProjectionType.ALL });
    this.handler = new NodejsFunction(this, 'OverlaySourceFunction', { entry: props.handlerEntry || join(process.cwd(), 'amplify', 'overlaySource', 'handler.ts'), handler: 'handler', runtime: Runtime.NODEJS_22_X, architecture: Architecture.ARM_64, memorySize: 512, timeout: Duration.seconds(15), bundling: { minify: true, sourceMap: true }, environment: { PUBLICATION_TABLE: this.publicationTable.tableName, CONNECTION_TABLE: this.connectionTable.tableName, WORKSPACE_TABLE: props.workspaceTable.tableName, BRAND_TABLE: props.brandTable.tableName, FRONTEND_ORIGIN: props.frontendOrigin } });
    this.publicationTable.grantReadWriteData(this.handler); this.connectionTable.grantReadWriteData(this.handler); props.workspaceTable.grantReadData(this.handler); props.brandTable.grantReadData(this.handler);
    this.handler.addToRolePolicy(new PolicyStatement({ effect: Effect.ALLOW, actions: ['dynamodb:TransactWriteItems'], resources: [this.publicationTable.tableArn] }));
    const integration = new HttpLambdaIntegration('OverlaySourceHttpIntegration', this.handler);
    const httpApi = new HttpApi(this, 'OverlaySourceHttpApi', { apiName: 'projectRespawnOverlaySourceApi', corsPreflight: { allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT, CorsHttpMethod.DELETE, CorsHttpMethod.OPTIONS], allowOrigins: [props.frontendOrigin], allowHeaders: ['authorization', 'content-type'] } });
    const authorizer = new HttpJwtAuthorizer('OverlayCreatorAuthorizer', `https://cognito-idp.${stack.region}.amazonaws.com/${props.userPoolId}`, { jwtAudience: [props.userPoolClientId] });
    httpApi.addRoutes({ path: '/overlay/source/{credential}', methods: [HttpMethod.GET], integration });
    httpApi.addRoutes({ path: '/overlay/twitch-config', methods: [HttpMethod.GET, HttpMethod.PUT], integration, authorizer });
    httpApi.addRoutes({ path: '/overlay/publications', methods: [HttpMethod.POST], integration, authorizer });
    httpApi.addRoutes({ path: '/overlay/publications/active', methods: [HttpMethod.GET], integration, authorizer });
    httpApi.addRoutes({ path: '/overlay/publications/{publicationId}', methods: [HttpMethod.PUT, HttpMethod.DELETE], integration, authorizer });
    httpApi.addRoutes({ path: '/overlay/publications/{publicationId}/events', methods: [HttpMethod.POST], integration, authorizer });
    httpApi.addRoutes({ path: '/overlay/publications/{publicationId}/rotate', methods: [HttpMethod.POST], integration, authorizer });
    const wsIntegration = new WebSocketLambdaIntegration('OverlaySourceWebSocketIntegration', this.handler);
    const wsApi = new WebSocketApi(this, 'OverlaySourceWebSocketApi', { apiName: 'projectRespawnOverlaySourceWebSocket', connectRouteOptions: { integration: wsIntegration }, disconnectRouteOptions: { integration: wsIntegration }, defaultRouteOptions: { integration: wsIntegration } });
    const wsStage = new WebSocketStage(this, 'OverlaySourceWebSocketStage', { webSocketApi: wsApi, stageName: 'live', autoDeploy: true });
    this.websocketUrl = `wss://${wsApi.apiId}.execute-api.${stack.region}.amazonaws.com/${wsStage.stageName}`;
    const managementUrl = `https://${wsApi.apiId}.execute-api.${stack.region}.amazonaws.com/${wsStage.stageName}`;
    this.handler.addEnvironment('WEBSOCKET_URL', this.websocketUrl); this.handler.addEnvironment('WEBSOCKET_MANAGEMENT_URL', managementUrl);
    this.handler.addToRolePolicy(new PolicyStatement({ effect: Effect.ALLOW, actions: ['execute-api:ManageConnections'], resources: [`arn:${stack.partition}:execute-api:${stack.region}:${stack.account}:${wsApi.apiId}/${wsStage.stageName}/POST/@connections/*`] }));
    this.httpUrl = httpApi.url!;
  }
}
