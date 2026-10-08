import fs from 'node:fs';
import assert from 'node:assert/strict';
// Separate candidate preserves the accepted 2B4A/B source and package hashes.
const out='domains/team-hub/cutover/';
let service=fs.readFileSync('domains/team-hub/service.mjs','utf8');
service=service.replaceAll("from './repository.mjs'","from '../repository.mjs'").replace("from './core.mjs'","from '../auth.mjs'");
service=service.replace('  authorize(op,','  async authorize(op,');
service=service.replaceAll("this.core.allows(actor, 'teams.admin')","(await this.core.allows(actor, 'teams.admin'))").replaceAll("this.core.allows(actor, 'teams.branding.manage')","(await this.core.allows(actor, 'teams.branding.manage'))");
service=service.replaceAll('this.authorize(op, actor, aggregate)','await this.authorize(op, actor, aggregate)').replaceAll('this.authorize(op, actor, current)','await this.authorize(op, actor, current)').replaceAll('state => {\n      this.authorize(op, actor, state.teams[teamId]);','async state => {\n      await this.authorize(op, actor, state.teams[teamId]);');
service=service.replaceAll('this.core.resolve(actor, req.targetAccount)','(await this.core.resolve(actor, req.targetAccount, teamId))');
service=service.replace("else response = { items: this.core.search(actor, req.query, req.limit).map(item => ({ subject: item.subject, displayName: item.displayName })) };","else { const page = await this.core.search(actor, req.query, req.limit, teamId, req.nextToken); response = {items: page.items.map(item => ({subject:item.subject,displayName:item.displayName})), ...(page.nextToken?{nextToken:page.nextToken}:{})}; }");
service=service.replace("const req = validateRequest(op, request);","if (brandingOps.has(op) || op === 'UPSERT_COACH_ASSESSMENT' && request.privateNote !== '') fail('FORBIDDEN');\n    const req = validateRequest(op, request);");
service=service.replace('(admin || activeMembership(a, actor))','(admin || a.team.status === \'ACTIVE\' && activeMembership(a, actor))');
assert.ok(!service.includes('this.core.search(actor, req.query, req.limit).map'));
fs.writeFileSync(out+'service.mjs',service);
let repository=fs.readFileSync('domains/team-hub/parity/repository.mjs','utf8');
repository=repository.replace("from '../repository.mjs'","from '../repository.mjs'").replace("from './codec.mjs'","from '../parity/codec.mjs'");
repository="import {readAuthority,requireTarget,authorityCondition} from './authority.mjs';\n"+repository;
repository=repository.replace('this.scope(c.teamId);const {items','const authority=requireTarget(await readAuthority(this.transport));if(authority.epoch!==this.authority.epoch||authority.version!==this.authority.version)fail(\'CONFLICT\');this.scope(c.teamId);const {items');
repository=repository.replaceAll('authorize(state);','await authorize(state);').replaceAll('authorize({teams:latest.aggregate?{[c.teamId]:latest.aggregate}:{}});','await authorize({teams:latest.aggregate?{[c.teamId]:latest.aggregate}:{}});');
repository=repository.replace("SK:c.operation+'#'+c.key","SK:c.operation+'#AUTH'+authority.epoch+'#'+c.key");
repository=repository.replace('const tx=[];','const tx=[authorityCondition(authority)];');
repository=repository.replace('// Recheck configured verification lease immediately before dispatch; no live authority record is seeded.','// Authority ConditionCheck commits atomically with every business/audit/idempotency write.');
repository=repository.replace(" async listCandidateTeamIds(){fail('DEPENDENCY_UNAVAILABLE');} // No new public listing or Scan permission.",` async listCandidateTeamIds(actor){
  const ids=new Set();const admin=await this.isAdmin(actor);const queries=admin?['ACTIVE','INACTIVE'].map(status=>({IndexName:'ByTeamStatus',KeyConditionExpression:'StatusPK = :pk',ExpressionAttributeValues:{':pk':'STATUS#'+status}})):[{IndexName:'BySubject',KeyConditionExpression:'SubjectPK = :pk',ExpressionAttributeValues:{':pk':'SUBJECT#'+hash(actor.issuer)+'#'+actor.subject}}];
  for(const q of queries){let key;do{let page;try{page=await this.transport.query({TableName:this.operational,...q,ConsistentRead:false,Limit:100,...(key?{ExclusiveStartKey:key}:{})});}catch{fail('DEPENDENCY_UNAVAILABLE');}for(const row of page.Items??[])if(row.PK?.startsWith('TEAM#'))ids.add(row.PK.slice(5));if(ids.size>500)fail('LIMIT_EXCEEDED');key=page.LastEvaluatedKey;}while(key&&Object.keys(key).length);}
  return [...ids].sort(); // Each candidate is re-read strongly and authorized by TeamService.
 }`);
assert.ok(repository.includes('const tx=[authorityCondition(authority)]'));
fs.writeFileSync(out+'repository.mjs',repository);
let http=fs.readFileSync('domains/team-hub/http.mjs','utf8');
fs.writeFileSync(out+'http.mjs',http);
console.log('Derived separate async Core/authority candidate; accepted parity files unchanged.');
