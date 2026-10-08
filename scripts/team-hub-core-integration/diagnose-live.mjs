import {aws,save} from './aws.mjs';
const since=Date.now()-15*60000,results=[];
for(const logGroupName of ['/project-respawn/Ntgre/team-hub/parity-read','/project-respawn/Ntgre/core/contracts']){
 const response=await aws('logs','filter-log-events',{logGroupName,startTime:since});const entries=[];
 for(const e of response.events??[]){let x;try{x=JSON.parse(e.message);}catch{continue;}let m=x.message??x;if(typeof m==='string')try{m=JSON.parse(m);}catch{m={};}
  entries.push({timestamp:e.timestamp,type:x.type,event:m.event,code:m.code,status:m.status,errorName:m.errorName,deniedAction:m.deniedAction,requestId:m.requestId,errorType:m.errorType??x.errorType,errorMessage:typeof m.errorMessage==='string'?m.errorMessage.replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g,'[REDACTED]').slice(0,1200):undefined});
 }results.push({logGroupName,entries});
}
save('live-diagnosis',{at:new Date().toISOString(),results});console.log(JSON.stringify(results));
