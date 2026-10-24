import assert from 'node:assert/strict';
import {E,read,save,retryRead as aws} from './dark-common.mjs';
const kind=process.argv[2];assert(['security','product'].includes(kind));
const installed=read(E+'/'+kind+'-installed.json');assert(installed.passed);const result={at:new Date().toISOString(),policies:[],passed:false};
for(const resource of installed.resources){let documents=[];
 if(resource.ResourceType==='AWS::IAM::ManagedPolicy'){const p=(await aws('iam','get-policy',{PolicyArn:resource.PhysicalResourceId})).Policy;documents.push({id:resource.LogicalResourceId,document:(await aws('iam','get-policy-version',{PolicyArn:p.Arn,VersionId:p.DefaultVersionId})).PolicyVersion.Document});}
 if(resource.ResourceType==='AWS::IAM::Role'){const names=(await aws('iam','list-role-policies',{RoleName:resource.PhysicalResourceId})).PolicyNames;for(const name of names)documents.push({id:resource.LogicalResourceId+'.'+name,document:(await aws('iam','get-role-policy',{RoleName:resource.PhysicalResourceId,PolicyName:name})).PolicyDocument});}
 for(const {id,document} of documents){const analysis=await aws('accessanalyzer','validate-policy',{policyType:'IDENTITY_POLICY',policyDocument:JSON.stringify(document)});assert(!analysis.nextToken,'ANALYZER_PAGINATION_REQUIRED');const blocking=analysis.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType));result.policies.push({id,findings:analysis.findings,blocking: blocking.length});save(kind+'-installed-analyzer.json',result);assert.deepEqual(blocking,[],id+' BLOCKING_ANALYZER');}
}
result.passed=true;save(kind+'-installed-analyzer.json',result);console.log(JSON.stringify({kind,policies:result.policies.length,blockingFindings:0,passed:true}));
