import { Aspects, CfnResource, RemovalPolicy, Stack } from 'aws-cdk-lib';
import type { IConstruct } from 'constructs';

function retainResource(construct: IConstruct) {
  if (!(construct instanceof CfnResource)) return;

  construct.applyRemovalPolicy(RemovalPolicy.RETAIN, {
    applyToUpdateReplacePolicy: true,
  });
}

/**
 * Phase 1 of the hosted staging auth migration.
 *
 * The staging User Pool was deleted outside CloudFormation. Before staging can
 * move to referenceAuth, every surviving resource in the currently-owned auth
 * stack must be retained when it is removed from the later Phase 2 template.
 * Applying this to the entire auth stack also protects support resources such
 * as IAM policies and Lambdas that must not be deleted accidentally.
 */
export function applyHostedStagingAuthRetention(
  authStack: Stack,
  branchName: string | undefined = process.env.AWS_BRANCH,
): string[] {
  if (branchName !== 'staging') return [];

  const retainedLogicalIds: string[] = [];

  // Some IAM policies are materialized lazily during synthesis. The Aspect
  // protects those resources as well as constructs already present below.
  Aspects.of(authStack).add({ visit: retainResource });

  for (const construct of authStack.node.findAll()) {
    if (!(construct instanceof CfnResource)) continue;

    retainResource(construct);
    retainedLogicalIds.push(construct.logicalId);
  }

  return retainedLogicalIds.sort();
}
