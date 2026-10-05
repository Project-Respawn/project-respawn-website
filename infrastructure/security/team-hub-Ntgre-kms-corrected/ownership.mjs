import {aws,read,save,dir} from './read-aws.mjs';
const inventory=read(dir+'/key-inventory.json');
// Historical ownership supplies read-only lookup locations, never a policy ARN.
const history=read('docs/architecture/phase2a-tournament-kms-correction-evidence-2026-10-04/key-inventory.json');
for(const key of inventory.keys.filter(k=>k.classification==='UNKNOWN_CUSTOMER_MANAGED_KEY')){
 const locations=history.keys.find(k=>k.id===key.id)?.ownership??[];
 for(const location of locations){const result=(await aws('cloudformation','describe-stack-resource','--stack-name',location.stack,'--logical-resource-id',location.logicalId)).StackResourceDetail;
  if(result.ResourceType==='AWS::KMS::Key'&&[key.id,key.arn].includes(result.PhysicalResourceId)&&result.ResourceStatus!=='DELETE_COMPLETE'){key.classification='PROJECT_RESPAWN_BUSINESS_KEY';key.ownership={at:new Date().toISOString(),stackId:result.StackId,logicalId:result.LogicalResourceId,physicalId:result.PhysicalResourceId,status:result.ResourceStatus};}
 }
}
inventory.counts=inventory.keys.reduce((s,k)=>(s[k.classification]=(s[k.classification]??0)+1,s),{});save('key-inventory',inventory);
const artifact=read(dir+'/artifact-encryption.json');artifact.bucketDefaultKmsDependency=inventory.keys.find(k=>k.aliases.includes('alias/aws/s3'))?.arn??'UNRESOLVED';artifact.teamPublishedObjectKmsDependency=null;save('artifact-encryption',artifact);
console.log(JSON.stringify(inventory.counts));
