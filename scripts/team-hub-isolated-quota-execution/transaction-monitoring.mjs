import assert from 'node:assert/strict';
import {aws} from '../team-hub-describekey-execution/aws.mjs';
import {E,read,save} from './common.mjs';
const tx=read(E+'/transactions.json');assert.equal(tx.complete,true);
const start=new Date(Math.floor(Date.parse(tx.at)/60000)*60000),end=new Date(Math.ceil((Date.parse(tx.requests.at(-1).at)+1)/60000)*60000);
const r={at:new Date().toISOString(),complete:false,pending:[],requestCount:tx.requests.length,errors:{},metrics:[],window:{start:start.toISOString(),end:end.toISOString()}};
for(const x of tx.requests.filter(x=>x.error)){assert.ok(['TransactionCanceledException','ConditionalCheckFailedException'].includes(x.error),'Unexpected service failure');r.errors[x.error]=(r.errors[x.error]??0)+1;assert.ok(x.requestId);}
for(const {table} of read(E+'/installed.json').tables)for(const MetricName of ['ConsumedReadCapacityUnits','ConsumedWriteCapacityUnits','ReadThrottleEvents','WriteThrottleEvents']){
 const m=await aws('cloudwatch','get-metric-statistics',{Namespace:'AWS/DynamoDB',MetricName,Dimensions:[{Name:'TableName',Value:table.TableName}],StartTime:start.toISOString(),EndTime:end.toISOString(),Period:60,Statistics:['Sum']});const sum=m.Datapoints.reduce((n,x)=>n+x.Sum,0);r.metrics.push({table:table.TableName,name:MetricName,sum,...m});if(MetricName.startsWith('Consumed')){if(sum===0)r.pending.push(table.TableName+':'+MetricName);}else assert.equal(sum,0,'Unexpected table throttling');
}
r.complete=r.pending.length===0;r.scope='Real DynamoDB SDK receipts and isolated table metrics; synthetic Core/personas, no deployed business API success claim';save('transaction-monitoring',r);console.log(JSON.stringify({complete:r.complete,pending:r.pending,requests:r.requestCount,errors:r.errors}));
