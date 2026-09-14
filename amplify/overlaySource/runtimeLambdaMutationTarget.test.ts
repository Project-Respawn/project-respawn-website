import assert from 'node:assert/strict';
import test from 'node:test';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  assertRuntimeLambdaMutationTarget,
  type RuntimeLambdaMutationTarget,
} from './runtimeLambdaMutationTarget';

test('overlay runtime wiring accepts only the two required Lambda mutations', () => {
  const environments: Array<[string, string]> = [];
  const policies: PolicyStatement[] = [];
  const target: RuntimeLambdaMutationTarget = {
    addEnvironment(key, value) {
      environments.push([key, value]);
    },
    addToRolePolicy(statement) {
      policies.push(statement);
    },
  };

  target.addEnvironment('OVERLAY_PUBLICATION_TABLE', 'publication-table');
  target.addToRolePolicy(new PolicyStatement({ actions: ['dynamodb:GetItem'], resources: ['*'] }));

  assert.deepEqual(environments, [['OVERLAY_PUBLICATION_TABLE', 'publication-table']]);
  assert.equal(policies.length, 1);
});

test('Amplify boundary rejects a Lambda construct without addEnvironment', () => {
  const interfaceOnlyLambda = {
    addToRolePolicy() {},
  } as unknown as IFunction;

  assert.throws(
    () => assertRuntimeLambdaMutationTarget(interfaceOnlyLambda),
    /Amplify runtime Lambda does not support addEnvironment/,
  );
});
