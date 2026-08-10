import assert from 'node:assert/strict';
import test from 'node:test';
import { App, CfnResource, Stack } from 'aws-cdk-lib';
import { applyHostedStagingAuthRetention } from './retention';

function synthesize(branchName: string | undefined) {
  const app = new App();
  const stack = new Stack(app, 'AuthRetentionFixture');
  new CfnResource(stack, 'IdentityPool', {
    type: 'AWS::Cognito::IdentityPool',
    properties: { AllowUnauthenticatedIdentities: true },
  });
  new CfnResource(stack, 'AuthenticatedRole', {
    type: 'AWS::IAM::Role',
    properties: { AssumeRolePolicyDocument: {} },
  });

  const retained = applyHostedStagingAuthRetention(stack, branchName);
  return {
    retained,
    template: app.synth().getStackArtifact(stack.artifactId).template,
  };
}

test('hosted staging retains every auth-stack CloudFormation resource', () => {
  const { retained, template } = synthesize('staging');

  assert.equal(retained.length, 2);
  for (const resource of Object.values(template.Resources) as Array<Record<string, unknown>>) {
    assert.equal(resource.DeletionPolicy, 'Retain');
    assert.equal(resource.UpdateReplacePolicy, 'Retain');
  }
});

for (const branchName of ['master', 'main', 'production', undefined]) {
  test(`${branchName ?? 'local sandbox'} does not receive hosted staging retention`, () => {
    const { retained, template } = synthesize(branchName);

    assert.deepEqual(retained, []);
    for (const resource of Object.values(template.Resources) as Array<Record<string, unknown>>) {
      assert.equal(resource.DeletionPolicy, undefined);
      assert.equal(resource.UpdateReplacePolicy, undefined);
    }
  });
}
