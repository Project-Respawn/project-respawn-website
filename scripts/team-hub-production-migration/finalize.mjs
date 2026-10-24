// Offline evidence finalization; no AWS operations and no raw business data.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root='docs/architecture/team-hub-production-migration-2026-10-24';
const read=p=>JSON.parse(fs.readFileSync(p));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const log=p=>{const b=fs.readFileSync(p);return b[0]===255&&b[1]===254?b.toString('utf16le'):b.toString('utf8');};
const security=read(root+'/runtime-candidate/security-validation.json');
assert.equal(security.certificationPassed,true,'Security certification is incomplete');
assert(security.cases.every(c=>c.passed));assert.equal(security.templates.length,2);
const blocking=security.policies.flatMap(p=>p.analyzer.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)).map(f=>({policy:p.id,issueCode:f.issueCode,detail:f.findingDetails})));
assert.equal(blocking.length,2);assert(blocking.every(f=>f.issueCode==='INVALID_ACTION'&&f.detail.includes('apigateway:TagResource')));
const tests=log('.tmp/team-hub-production-migration-final-tests.log');assert(/tests 55/.test(tests)&&/pass 55/.test(tests)&&/fail 0/.test(tests));
const accounting=log('.tmp/team-hub-production-accounting.log');assert(/tests 41/.test(accounting)&&/pass 41/.test(accounting)&&/fail 0/.test(accounting));
const build=log('.tmp/team-hub-production-build.log');assert(/built in/.test(build));
const ledger=JSON.parse(execFileSync(process.execPath,['scripts/migration/ledger.mjs','check'],{encoding:'utf8'}));
const files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=p+'/'+e.name;if(e.isDirectory())walk(f);else if(/\.(mjs|json)$/.test(f))files.push(f);}}
['scripts/team-hub-production-migration',root].forEach(walk);
const findings=[];for(const file of files){const text=fs.readFileSync(file,'utf8');for(const[name,pattern]of [['awsAccessKey',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],['privateKey',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['jwt',/\beyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{40,}\b/]])if(pattern.test(text))findings.push({file,name});}
assert.deepEqual(findings,[]);
const summary={schemaVersion:'production-team-hub-current-data-validation.v1',capturedAt:new Date().toISOString(),awsWrites:0,tests:{focused:55,resourceAccounting:41,failed:0},typescript:{passed:true,configuration:'infrastructure/domains/team-hub/tsconfig.json',typeRoots:'./node_modules/@types'},build:{passed:true,published:false,logSha256:hash('.tmp/team-hub-production-build.log'),limitation:'Local working-tree build includes unrelated changes and existing chunk-size warnings; it is not the public release artifact.'},ledger,secretScan:{files:files.length,findings,rawProductionRecordsPersisted:false,limitation:'Pattern scan and scoped data-handling review do not prove absence of every possible secret encoding.'},scopeDiffCheck:{passed:true,unrelatedIssue:'Pre-existing AGENTS.md trailing blank line left unchanged.'},security:{certificationPassed:true,cases:security.cases.length,templates:security.templates.length,blocking,ownerExceptionAccepted:false,executionAuthorized:false},migration:{receipt:root+'/migration-dry-run-v2.json',postWriteReverseCertified:false},executionProposal:{path:root+'/dark-parity-execution.PROPOSED.json',sha256:hash(root+'/dark-parity-execution.PROPOSED.json')},limitations:['No installed-role/live dark acceptance of this proposed update','No source freeze, fence, import, authority transfer or frontend publication','Full production maintenance and state-aware post-write recovery require separately reviewed pins and authorization']};
fs.writeFileSync(root+'/validation-summary.json',JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(summary));
