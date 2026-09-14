import assert from 'node:assert/strict';
import test from 'node:test';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { composeOverlaySourceStack } from './composition';

test('Amplify composition resolves the real model table keys before wiring Lambda, IAM, and outputs', () => {
  const app = new App();
  const stack = new Stack(app, 'OverlaySourceCompositionTest', { env: { account: '123456789012', region: 'eu-north-1' } });
  const workspace = Table.fromTableName(stack, 'Workspace', 'CreatorWorkspaceRecordTable');
  const brand = Table.fromTableName(stack, 'Brand', 'BrandTable');
  let output: Record<string, unknown> | undefined;
  const result = composeOverlaySourceStack({
    stack,
    tables: { CreatorWorkspaceRecord: workspace, Brand: brand },
    userPoolId: 'eu-north-1_pool',
    userPoolClientId: 'client-id',
    frontendOrigin: 'https://www.projectrespawn.com',
    addOutput(value) { output = value; },
  });

  assert.ok(result.publicationTable?.tableName);
  assert.ok(result.connectionTable?.tableName);
  assert.equal(workspace.tableName, 'CreatorWorkspaceRecordTable');
  assert.equal(brand.tableName, 'BrandTable');
  assert.ok((output as any)?.custom?.overlaySource?.httpUrl);
  assert.ok((output as any)?.custom?.overlaySource?.websocketUrl);

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Lambda::Function', { Environment: { Variables: {
    PUBLICATION_TABLE: Match.anyValue(), CONNECTION_TABLE: Match.anyValue(),
    WORKSPACE_TABLE: 'CreatorWorkspaceRecordTable', BRAND_TABLE: 'BrandTable',
  } } });
  template.hasResourceProperties('AWS::IAM::Policy', { PolicyDocument: { Statement: Match.arrayWith([
    Match.objectLike({ Action: Match.arrayWith(['dynamodb:GetItem']), Resource: Match.anyValue() }),
  ]) } });
});

test('composition fails clearly when the obsolete CreatorWorkspace registry key is supplied', () => {
  const app = new App();
  const stack = new Stack(app, 'InvalidOverlaySourceComposition');
  const brand = Table.fromTableName(stack, 'Brand', 'BrandTable');
  assert.throws(() => composeOverlaySourceStack({
    stack,
    tables: { Brand: brand, CreatorWorkspace: Table.fromTableName(stack, 'WrongWorkspace', 'WrongWorkspace') } as any,
    userPoolId: 'pool', userPoolClientId: 'client', frontendOrigin: 'https://www.projectrespawn.com', addOutput() {},
  }), /CreatorWorkspaceRecord table is unavailable/);
});
