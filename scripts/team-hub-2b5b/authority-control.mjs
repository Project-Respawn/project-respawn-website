import assert from 'node:assert/strict';
export const table='ProjectRespawn-TeamHub-Ntgre-Journal';
export const key=Object.freeze({PK:'CONTROL#AUTHORITY',SK:'STATE'});
const modes=['LEGACY_WRITER','FROZEN','TARGET_WRITER'];
export function validateControl(row){
 assert.deepEqual(Object.keys(row).sort(),['PK','SK','schemaVersion','mode','epoch','version','changedAt','changedBy','gateDigest'].sort());
 assert.equal(row.PK,key.PK);assert.equal(row.SK,key.SK);assert.equal(row.schemaVersion,'team-hub-authority.v1');assert.ok(modes.includes(row.mode));
 for(const field of ['epoch','version'])assert.ok(Number.isSafeInteger(row[field])&&row[field]>0);
 assert.ok(typeof row.changedAt==='string'&&Number.isFinite(Date.parse(row.changedAt)));
 assert.ok(typeof row.changedBy==='string'&&row.changedBy.length>0&&row.changedBy.length<=200);assert.match(row.gateDigest,/^[a-f0-9]{64}$/);return row;
}
// Produces reviewable requests only; this module has no AWS dependency or executor.
export function initialize({changedAt,changedBy,gateDigest}){return {TableName:table,Item:validateControl({...key,schemaVersion:'team-hub-authority.v1',mode:'LEGACY_WRITER',epoch:1,version:1,changedAt,changedBy,gateDigest}),ConditionExpression:'attribute_not_exists(PK) AND attribute_not_exists(SK)'};}
export function transition(previous,mode,metadata){validateControl(previous);assert.ok(modes.includes(mode)&&mode!==previous.mode);assert.ok(previous.mode==='FROZEN'||mode==='FROZEN','Writer transfer requires FROZEN');const next=validateControl({...previous,mode,epoch:previous.epoch+1,version:previous.version+1,...metadata});assert.equal(next.mode,mode);assert.equal(next.epoch,previous.epoch+1);assert.equal(next.version,previous.version+1);return {TableName:table,Item:next,ConditionExpression:'#mode = :mode AND #epoch = :epoch AND #version = :version',ExpressionAttributeNames:{'#mode':'mode','#epoch':'epoch','#version':'version'},ExpressionAttributeValues:{':mode':previous.mode,':epoch':previous.epoch,':version':previous.version}};}
