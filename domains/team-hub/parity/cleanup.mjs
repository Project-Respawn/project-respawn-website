import {createHash} from 'node:crypto';
import {cleanupPlan} from './fence.mjs';
import {canonical} from './repository.mjs';
const digest=x=>createHash('sha256').update(canonical(x)).digest('hex');
// No CLI or credentials. A later separately authorized verifier supplies transport
// plus its exact captured run receipt, after disabling/draining the test writer.
export async function cleanupSyntheticRun({transport,receipt,approvedReceiptDigest}){
 if(digest(receipt)!==approvedReceiptDigest||receipt.writerDisabledAndDrained!==true)throw Error('Reviewed receipt and stopped writer required');
 const plan=cleanupPlan(receipt,receipt.runId),deleted=[],retained=[];
 for(const k of plan){if(k.disposition==='RETAIN_SYNTHETIC_AUDIT'){retained.push(k);continue;}
  const TableName='ProjectRespawn-TeamHub-Ntgre-'+k.table,Key={PK:k.PK,SK:k.SK};
  const current=(await transport.get({TableName,Key,ConsistentRead:true})).Item;
  if(!current){deleted.push({...k,alreadyAbsent:true});continue;}
  if(current.version!==k.version||digest(current)!==k.itemDigest)throw Error('Cleanup record changed; stop without deleting it');
  await transport.transactWrite({TransactItems:[{Delete:{TableName,Key,ConditionExpression:'#v = :v',ExpressionAttributeNames:{'#v':'version'},ExpressionAttributeValues:{':v':k.version}}}]});deleted.push(k);
 }
 return {runId:receipt.runId,deleted,retainedAudit:retained,tableWipe:false};
}
