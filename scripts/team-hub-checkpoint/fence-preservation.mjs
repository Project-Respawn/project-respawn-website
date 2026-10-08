import fs from 'node:fs';
import assert from 'node:assert/strict';
import { aws, read, digest } from '../team-hub-2b6/coverage-read.mjs';
const f=read('docs/architecture/team-hub-2b5b-evidence-2026-10-07/fence-candidates.json');
const r={at:new Date().toISOString(),identity:await aws('sts','get-caller-identity'),tables:[],gateways:[],awsWrites:0,complete:false};
assert.equal(r.identity.Account,f.account);
for(const t of f.modes.FROZEN.tables){
  let policy=null,revision='NO_POLICY';
  try{const live=await aws('dynamodb','get-resource-policy','--resource-arn',t.arn);policy=JSON.parse(live.Policy);revision=live.RevisionId;}
  catch(e){if(!e.message.includes('PolicyNotFoundException'))throw e;}
  assert.equal(digest(policy),digest(f.existing[t.arn]??null));
  r.tables.push({arn:t.arn,revision,unchanged:true,policySha256:digest(policy)});
}
const bucket=f.modes.LEGACY_WRITER.bucket;
const policy=JSON.parse((await aws('s3api','get-bucket-policy','--bucket',bucket.name)).Policy);
assert.equal(digest(policy),f.bucketPolicySha256);
r.logo={bucket:bucket.name,unchanged:true,policySha256:digest(policy)};
for(const g of f.gateways){const live=(await aws('appsync','get-resolver','--api-id',g.api,'--type-name',g.type,'--field-name',g.field)).resolver;assert.equal(digest(live),g.beforeSha256);r.gateways.push({type:g.type,field:g.field,unchanged:true,sha256:digest(live)});}
r.complete=true;fs.writeFileSync('docs/architecture/team-hub-checkpoint-evidence-2026-10-08/source-fence-preservation.json',JSON.stringify(r,null,2)+'\n');
console.log(JSON.stringify({complete:true,tables:r.tables.length,gateways:r.gateways.length,logoPolicyUnchanged:true,awsWrites:0}));
