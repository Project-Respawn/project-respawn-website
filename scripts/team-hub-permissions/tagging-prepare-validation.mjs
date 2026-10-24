// Build a read-only certification harness for the proposed two-policy delta.
import fs from 'node:fs';
const E='docs/architecture/production-team-hub-tagging-recovery-2026-10-24';
let s=fs.readFileSync('scripts/team-hub-permissions/production-security.mjs','utf8');
s=s.replace("const E='docs/architecture/team-hub-production-permissions-candidate-2026-10-24/v2';",`const E='${E}';`);
s=s.replace("E+'/candidate.json'","E+'/candidate.PROPOSED.json'");
s=s.replace("const old=read('.codex-worktrees/team-hub-production-preparation/docs/architecture/production-team-hub-deployment-evidence-2026-10-21/security-validation.json');","const original=read('.codex-worktrees/team-hub-production-preparation/docs/architecture/production-team-hub-deployment-evidence-2026-10-21/security-validation.json');const secret=read('docs/architecture/production-team-hub-permissions-execution-2026-10-24/rollback-resource-inventory.json').secret.ARN;const translate=v=>typeof v==='string'?v.replaceAll('proof00001','9wk4a41l5m').replaceAll('arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Production-Cursor-Aa0Bb1',secret):Array.isArray(v)?v.map(translate):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,translate(x)])):v;const old=translate(original);");
s=s.replaceAll(".replaceAll('${HttpApi}','proof00001')",".replaceAll('${HttpApi}','9wk4a41l5m')").replace("const B='.tmp/team-hub-production-permissions/security'","const B='.tmp/team-hub-production-tagging/security'");
s=s.replace(" return rows;",` const allow=id==='security.ExecutionRole'||id==='security.ExecutionBoundary';
 for(const [name,resource,allowed,context]of [
 ['tag-stage-collection','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages',allow,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-default-stage','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages/$default',allow,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-api-root','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m',false,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-wrong-api','arn:aws:apigateway:eu-north-1::/apis/wrong12345/stages',false,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-wrong-region','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages',false,{'aws:RequestedRegion':'us-east-1'}],
 ['tag-no-region','arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages',false,{}],
 ['tag-foreign-rest-api','arn:aws:apigateway:eu-north-1::/restapis/wrong12345/stages',false,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-domain','arn:aws:apigateway:eu-north-1::/domainnames/projectrespawn.com',false,{'aws:RequestedRegion':'eu-north-1'}],
 ['tag-secret','arn:aws:secretsmanager:eu-north-1:058264289478:secret:foreign-123456',false,{'aws:RequestedRegion':'eu-north-1'}],
 ])rows.push({name,action:'apigateway:TagResource',resource,allowed,context});
 rows.push({name:'untag-remains-ungranted',action:'apigateway:UntagResource',resource:'arn:aws:apigateway:eu-north-1::/apis/9wk4a41l5m/stages',allowed:false,context:{'aws:RequestedRegion':'eu-north-1'}});
 return rows;`);
s=s.replace('const key=JSON.stringify([row.context,row.resource===\'*\']);',"const key=JSON.stringify([row.context,row.resource==='*',/^apigateway:(?:TagResource|UntagResource)$/.test(row.action)?row.action:'standard']);");
s=s.replace("assert.deepEqual(analyzer.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)),[],id+' ACCESS_ANALYZER');","const blocking=analyzer.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType));const expected=id==='security.ExecutionRole'||id==='security.ExecutionBoundary';if(expected){assert.equal(blocking.length,1,id+' UNEXPECTED_ANALYZER_FINDING');assert.equal(blocking[0].issueCode,'INVALID_ACTION');assert(blocking[0].findingDetails.includes('apigateway:TagResource'));}else assert.deepEqual(blocking,[]);result.analyzerExceptionAccepted=false;result.analyzerGate='BLOCKED_PENDING_EXPLICIT_OWNER_EXCEPTION';");
s=s.replace("result.passed=true;save();console.log", "result.certificationPassed=true;result.passed=false;result.requiresAnalyzerException=true;save();console.log");
s=s.replace("{passed:true,policies:result.policies.length", "{certificationPassed:true,analyzerGate:'BLOCKED_PENDING_EXPLICIT_OWNER_EXCEPTION',policies:result.policies.length");
fs.writeFileSync('scripts/team-hub-permissions/tagging-security-validation.mjs',s);
