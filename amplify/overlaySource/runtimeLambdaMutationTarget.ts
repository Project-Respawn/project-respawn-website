import type { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { EnvironmentOptions, IFunction } from 'aws-cdk-lib/aws-lambda';

/** The Lambda mutations required by the Phase 2A overlay runtime wiring. */
export interface RuntimeLambdaMutationTarget {
  addToRolePolicy(statement: PolicyStatement): void;
  addEnvironment(key: string, value: string, options?: EnvironmentOptions): unknown;
}

/**
 * Amplify exposes its Lambda as IFunction even though the runtime construct also
 * supports Function.addEnvironment(). Keep that mismatch contained at the
 * Amplify boundary and fail clearly if the runtime construct ever changes.
 */
export function assertRuntimeLambdaMutationTarget(
  value: IFunction,
): asserts value is IFunction & RuntimeLambdaMutationTarget {
  const candidate = value as IFunction & { addEnvironment?: unknown };
  if (typeof candidate.addEnvironment !== 'function') {
    throw new Error('Amplify runtime Lambda does not support addEnvironment');
  }
}
