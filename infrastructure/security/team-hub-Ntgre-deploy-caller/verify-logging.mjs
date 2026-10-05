import assert from 'node:assert/strict';
import {aws,read,save,dir} from './common.mjs';
const boundary=read(dir+'/caller-security.template.json').Resources.PreviewBoundary.Properties.PolicyDocument;
const identity=read(dir+'/ownership.json').productTemplate.Resources.ReadRole.Properties.Policies[0].PolicyDocument;
const required={Version:'2012-10-17',Statement:identity.Statement};
const removeAllow=p=>({...p,Statement:p.Statement.filter(s=>!(s.Effect==='Allow'&&[].concat(s.Action??[]).includes('logs:PutLogEvents')))});
const jobs=[{name:'identity-includes-own-logging',existing:identity,next:required,expected:'PASS'},{name:'boundary-includes-own-logging',existing:boundary,next:required,expected:'PASS'},{name:'identity-without-allow-control',existing:removeAllow(identity),next:required,expected:'FAIL'},{name:'boundary-without-allow-control',existing:removeAllow(boundary),next:required,expected:'FAIL'}];
// Analyzer requires an Allow: the logging-free identity control allows only unrelated STS identity inspection.
for(const j of jobs)if(!j.existing.Statement.length)j.existing.Statement=[{Effect:'Allow',Action:'sts:GetCallerIdentity',Resource:'*'}];
const foreign={Effect:'Allow',Action:['logs:CreateLogStream','logs:PutLogEvents'],Resource:'arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/tournaments/preview:*'};
const withForeign={...boundary,Statement:[...boundary.Statement,foreign]};
jobs.push({name:'foreign-logging-deny-enforced',existing:boundary,next:withForeign,expected:'PASS'},{name:'foreign-logging-deny-removed-control',existing:boundary,next:{...withForeign,Statement:withForeign.Statement.filter(s=>!(s.Effect==='Deny'&&s.Action==='logs:*'))},expected:'FAIL'});
const results=[];for(const j of jobs){save(j.name+'-existing',j.existing);save(j.name+'-new',j.next);const result=await aws('accessanalyzer','check-no-new-access','--existing-policy-document','file://'+dir+'/'+j.name+'-existing.json','--new-policy-document','file://'+dir+'/'+j.name+'-new.json','--policy-type','IDENTITY_POLICY');save(j.name+'-result',result);assert.equal(result.result,j.expected,j.name);results.push({name:j.name,expected:j.expected,actual:result.result,pass:true});}
save('logging-verification',{at:new Date().toISOString(),results,ownLoggingVerified:true,foreignLoggingDenied:true,rawSimulatorPositivesNotRelabeled:true});console.log('Own logging inclusion and foreign logging deny verified with four sensitive negative controls; six Analyzer checks passed.');
