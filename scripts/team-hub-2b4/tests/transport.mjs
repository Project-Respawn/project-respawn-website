import assert from 'node:assert/strict';
export class TransactionEmulator {
 constructor(){this.rows=new Map();this.transactions=[];this.beforeWrite=null;}
 key(table,k){return table+'|'+k.PK+'|'+k.SK;}
 async get(p){assert.equal(p.ConsistentRead,true);return {Item:structuredClone(this.rows.get(this.key(p.TableName,p.Key)))};}
 async query(p){assert.equal(p.ConsistentRead,true);const all=[...this.rows.entries()].filter(([k,v])=>k.startsWith(p.TableName+'|')&&v.PK===p.ExpressionAttributeValues[':pk']).map(([,v])=>v).sort((a,b)=>a.SK.localeCompare(b.SK));const start=p.ExclusiveStartKey?all.findIndex(x=>x.SK===p.ExclusiveStartKey.SK)+1:0;const items=all.slice(start,start+3);return {Items:structuredClone(items),...(start+3<all.length?{LastEvaluatedKey:{PK:items.at(-1).PK,SK:items.at(-1).SK}}:{})};}
 async transactWrite(p){if(this.beforeWrite){const fn=this.beforeWrite;this.beforeWrite=null;fn();}const seen=new Set();
  for(const action of p.TransactItems){const x=Object.values(action)[0],key=x.Item??x.Key,k=this.key(x.TableName,key);assert.ok(!seen.has(k),'Duplicate transaction item');seen.add(k);const old=this.rows.get(k),v=x.ExpressionAttributeValues??{};let pass;
   if(x.ConditionExpression==='attribute_not_exists(PK)')pass=!old;
   else if(x.ConditionExpression==='#v = :v')pass=old?.version===v[':v'];
   else if(x.ConditionExpression==='#v = :v AND authorizationEpoch = :epoch')pass=old?.version===v[':v']&&old?.authorizationEpoch===v[':epoch'];
   else if(x.ConditionExpression==='#v = :v AND expiresAt <= :now')pass=old?.version===v[':v']&&old?.expiresAt<=v[':now'];
   else throw Error('Unsupported condition '+x.ConditionExpression);
   if(!pass){const e=new Error('Transaction cancelled');e.name='TransactionCanceledException';throw e;}
  }
  const next=new Map(this.rows);for(const action of p.TransactItems){if(action.Put)next.set(this.key(action.Put.TableName,action.Put.Item),structuredClone(action.Put.Item));if(action.Delete)next.delete(this.key(action.Delete.TableName,action.Delete.Key));}this.rows=next;this.transactions.push(structuredClone(p));
 }
}
