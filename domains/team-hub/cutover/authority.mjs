import {fail} from '../contracts.mjs';
export const authorityKey=Object.freeze({PK:'CONTROL#AUTHORITY',SK:'STATE'});
export async function readAuthority(transport){
 let row;try{row=(await transport.get({TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:authorityKey,ConsistentRead:true})).Item;}catch{fail('DEPENDENCY_UNAVAILABLE');}
 if(row?.schemaVersion!=='team-hub-authority.v1'||!['LEGACY_WRITER','FROZEN','TARGET_WRITER'].includes(row.mode)||!Number.isSafeInteger(row.epoch)||row.epoch<1||!Number.isSafeInteger(row.version)||row.version<1||typeof row.gateDigest!=='string'||!/^[a-f0-9]{64}$/.test(row.gateDigest)||typeof row.changedAt!=='string'||!Number.isFinite(Date.parse(row.changedAt))||typeof row.changedBy!=='string'||!row.changedBy.length||row.changedBy.length>200)fail('DEPENDENCY_UNAVAILABLE');
 return row;
}
export function requireTarget(row){if(row.mode!=='TARGET_WRITER')fail('FORBIDDEN');return row;}
export function authorityCondition(row){requireTarget(row);return {ConditionCheck:{TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:authorityKey,ConditionExpression:'#mode = :mode AND #epoch = :epoch AND #version = :version',ExpressionAttributeNames:{'#mode':'mode','#epoch':'epoch','#version':'version'},ExpressionAttributeValues:{':mode':'TARGET_WRITER',':epoch':row.epoch,':version':row.version}}};}
