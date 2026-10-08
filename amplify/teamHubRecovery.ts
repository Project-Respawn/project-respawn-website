import { Aspects, CfnResource, RemovalPolicy, Stack, Token } from 'aws-cdk-lib';

export const TEAM_HUB_RECOVERY_MODELS = ['Team', 'TeamMembership', 'TeamRosterSlot', 'PlayerChampionPoolEntry'] as const;

/** Gate 1: persist recovery settings only on the existing protected Ntgre tables. */
export function preserveTeamHubRecovery(root: Stack, hostedBranch = process.env.AWS_BRANCH): void {
  if (hostedBranch || root.stackName !== 'amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332') return;
  if ((!Token.isUnresolved(root.account) && root.account !== '058264289478') ||
      (!Token.isUnresolved(root.region) && root.region !== 'eu-north-1')) {
    throw new Error('Team Hub recovery protection requires the approved Ntgre account and region.');
  }
  const resources = root.node.findAll().filter((node): node is CfnResource =>
    node instanceof CfnResource && node.cfnResourceType === 'Custom::AmplifyDynamoDBTable');
  for (const model of TEAM_HUB_RECOVERY_MODELS) {
    const matches = resources.filter(node => Stack.of(node).resolve(node.logicalId) === `${model}Table`);
    if (matches.length !== 1) throw new Error(`Expected one managed ${model}Table for recovery protection.`);
    const resource = matches[0];
    const apply = () => {
      resource.addPropertyOverride('pointInTimeRecoverySpecification.pointInTimeRecoveryEnabled', true);
      resource.addPropertyOverride('deletionProtectionEnabled', true);
      resource.addPropertyOverride('allowDestructiveGraphqlSchemaUpdates', false);
      resource.addPropertyOverride('replaceTableUponGsiUpdate', false);
      resource.applyRemovalPolicy(RemovalPolicy.RETAIN);
    };
    apply();
    // Run after the sandbox's default destroy-policy aspect. No unrelated resource is visited for mutation.
    Aspects.of(Stack.of(resource)).add({ visit(node) { if (node === resource) apply(); } }, { priority: 600 });
  }
}
