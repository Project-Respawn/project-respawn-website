import {fail} from '../contracts.mjs';
export const authorityStates=Object.freeze(['LEGACY_WRITER','FROZEN','TARGET_WRITER']);
export function writerAllowed(authority,writer){return authorityStates.includes(authority)&&((authority==='LEGACY_WRITER'&&writer==='legacy')||(authority==='TARGET_WRITER'&&writer==='target'));}
export function assertWriter(authority,writer){if(!writerAllowed(authority,writer))fail('FORBIDDEN');}
export function targetAuthorityCondition({mode,epoch,version}){
 assertWriter(mode,'target');if(!Number.isInteger(epoch)||epoch<0||!Number.isInteger(version)||version<1)fail('INVALID_INPUT');
 // Future production transaction primitive. Not installed/seeded/used by the
 // synthetic verification adapter, whose lease is external and separately scoped.
 return {ConditionCheck:{TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:{PK:'CONTROL#AUTHORITY',SK:'STATE'},ConditionExpression:'#mode = :mode AND #epoch = :epoch AND #version = :version',ExpressionAttributeNames:{'#mode':'mode','#epoch':'epoch','#version':'version'},ExpressionAttributeValues:{':mode':'TARGET_WRITER',':epoch':epoch,':version':version}}};
}
// Verification is a separate, bounded synthetic scope, never a business-authority override.
export function verifyScope(config,actor,teamId,now){
 if(config?.mode!=='SYNTHETIC_VERIFICATION'||config.authority!=='LEGACY_WRITER'||!Number.isSafeInteger(config.expiresAt)||now>=config.expiresAt||!Number.isSafeInteger(config.notBefore)||now<config.notBefore||config.expiresAt-config.notBefore>21600)fail('FORBIDDEN');
 if(!/^[a-z0-9]{8,16}$/.test(config.runId)||!teamId.startsWith(`team:phase2b4-test-${config.runId}-`)||!config.teamIds?.includes(teamId))fail('FORBIDDEN');
 if(actor.issuer!==config.issuer||!config.accounts?.some(a=>a.subject===actor.subject))fail('FORBIDDEN');
 return true;
}
export function cleanupPlan(receipt,runId){
 if(receipt?.runId!==runId||!Array.isArray(receipt.createdKeys)||!receipt.complete)throw Error('Exact complete run receipt required');
 const prefix=`team:phase2b4-test-${runId}-`;
 if(!/^[a-z0-9]{8,16}$/.test(runId))throw Error('Invalid run');
 const seen=new Set();return receipt.createdKeys.map(k=>{
  if(!['Operational','Journal'].includes(k.table)||!k.teamId?.startsWith(prefix)||typeof k.PK!=='string'||typeof k.SK!=='string'||!Number.isInteger(k.version))throw Error('Unbound cleanup key');
  const expected=k.table==='Operational'?(k.PK===`TEAM#${k.teamId}`||k.PK===`SLUG#${k.teamId.slice(5)}`):(k.PK===`TEAM#${k.teamId}`||k.PK.endsWith('#'+k.teamId)&&k.PK.startsWith('IDEMP#'));
  const id=k.table+'|'+k.PK+'|'+k.SK;if(!expected||seen.has(id)||k.PK==='CONTROL#AUTHORITY')throw Error('Foreign/duplicate cleanup key');seen.add(id);
  // Plan only. Audit rows retained by default; no table wipe or AWS executor.
  return {...k,disposition:k.table==='Journal'&&k.SK.startsWith('AUDIT#')?'RETAIN_SYNTHETIC_AUDIT':'DELETE_WITH_VERSION_AND_RUN_RECEIPT_CHECK'};
 });
}
