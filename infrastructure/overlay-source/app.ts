import { App, Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { OverlaySourceInfrastructure } from '../../amplify/overlaySource/infrastructure';

const app = new App();
const stack = new Stack(app, 'ProjectRespawnOverlaySourceReview', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-north-1',
  },
  description: 'Synth-only review template for the dedicated Project Respawn Overlay Browser Source infrastructure',
});

new OverlaySourceInfrastructure(stack, 'OverlaySource', {
  workspaceTable: Table.fromTableName(stack, 'CreatorWorkspaceTable', process.env.OVERLAY_REVIEW_WORKSPACE_TABLE || 'MASTER-CreatorWorkspace'),
  brandTable: Table.fromTableName(stack, 'BrandTable', process.env.OVERLAY_REVIEW_BRAND_TABLE || 'MASTER-Brand'),
  userPoolId: process.env.OVERLAY_REVIEW_USER_POOL_ID || 'eu-north-1_REVIEWONLY',
  userPoolClientId: process.env.OVERLAY_REVIEW_USER_POOL_CLIENT_ID || 'reviewonlyclient',
  frontendOrigin: 'https://www.projectrespawn.com',
});

app.synth();
