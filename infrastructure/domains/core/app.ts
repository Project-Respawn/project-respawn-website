import {App,Stack,CfnResource,BootstraplessSynthesizer} from 'aws-cdk-lib';
import {readFileSync} from 'node:fs';
if(process.env.CORE_OFFLINE!=='1'||process.env.CORE_ACCOUNT!=='058264289478'||process.env.CORE_REGION!=='eu-north-1')throw Error('Explicit offline Ntgre Core selection required');
const app=new App({outdir:process.env.CORE_OUT!,analyticsReporting:false});
for(const [kind,name] of [['product','ProjectRespawn-Core-Ntgre'],['security','ProjectRespawn-Core-Ntgre-Security']]){
 const template=JSON.parse(readFileSync(`${process.env.CORE_INPUT}/${kind}.json`,'utf8'));
 const stack=new Stack(app,name,{stackName:name,env:{account:'058264289478',region:'eu-north-1'},synthesizer:new BootstraplessSynthesizer()});
 for(const [id,raw] of Object.entries(template.Resources)){
  const r=raw as {Type:string,Properties:Record<string,unknown>,DeletionPolicy?:string,UpdateReplacePolicy?:string};
  const resource=new CfnResource(stack,id,{type:r.Type,properties:r.Properties});resource.overrideLogicalId(id);
  if(r.DeletionPolicy)resource.addOverride('DeletionPolicy',r.DeletionPolicy);
  if(r.UpdateReplacePolicy)resource.addOverride('UpdateReplacePolicy',r.UpdateReplacePolicy);
 }
}
app.synth();
