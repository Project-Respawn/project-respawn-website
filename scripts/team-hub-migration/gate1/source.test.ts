import test from 'node:test';
import assert from 'node:assert/strict';
import { App, Aspects, CfnResource, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { preserveTeamHubRecovery, TEAM_HUB_RECOVERY_MODELS } from '../../../amplify/teamHubRecovery';
function fixture(name='amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332') {
 const app=new App();const stack=new Stack(app,'Test',{stackName:name,env:{account:'058264289478',region:'eu-north-1'}});
 for(const model of [...TEAM_HUB_RECOVERY_MODELS,'Unrelated']){const r=new CfnResource(stack,model,{type:'Custom::AmplifyDynamoDBTable',properties:{tableName:model,allowDestructiveGraphqlSchemaUpdates:true,replaceTableUponGsiUpdate:true}});r.overrideLogicalId(model+'Table');}
 Aspects.of(stack).add({visit(n){if(n instanceof CfnResource)n.applyRemovalPolicy(RemovalPolicy.DESTROY);}});
 return stack;
}
test('only four approved custom tables retain protections after sandbox destroy aspect',()=>{const s=fixture();preserveTeamHubRecovery(s,'');const t=Template.fromStack(s).toJSON();for(const model of TEAM_HUB_RECOVERY_MODELS){const r=t.Resources[model+'Table'];assert.equal(r.DeletionPolicy,'Retain');assert.equal(r.UpdateReplacePolicy,'Retain');assert.equal(r.Properties.deletionProtectionEnabled,true);assert.equal(r.Properties.pointInTimeRecoverySpecification.pointInTimeRecoveryEnabled,true);assert.equal(r.Properties.allowDestructiveGraphqlSchemaUpdates,false);assert.equal(r.Properties.replaceTableUponGsiUpdate,false);}assert.equal(t.Resources.UnrelatedTable.DeletionPolicy,'Delete');assert.equal(t.Resources.UnrelatedTable.Properties.deletionProtectionEnabled,undefined);});
test('hosted branches and other sandbox stacks are untouched',()=>{for(const [name,branch]of [['production','master'],['staging','staging'],['other-sandbox',''],['amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332','development']]){const s=fixture(name);preserveTeamHubRecovery(s,branch);for(const r of Object.values(Template.fromStack(s).toJSON().Resources)as any[])assert.equal(r.Properties.deletionProtectionEnabled,undefined);}});
test('missing expected table fails closed',()=>{const s=fixture();s.node.tryRemoveChild('Team');assert.throws(()=>preserveTeamHubRecovery(s,''),/Expected one/);});
