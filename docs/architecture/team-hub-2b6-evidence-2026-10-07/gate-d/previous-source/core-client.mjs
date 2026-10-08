import {fail} from '../contracts.mjs';
export function realCore({invoke,accessToken,actor,environment,clock}){
 async function call(request){let r;try{r=await invoke({environment:environment.environment,accessToken,...request});}catch{fail('DEPENDENCY_UNAVAILABLE');}
  if(!r?.ok){if(r?.error?.code==='FORBIDDEN'||r?.error?.code==='UNAUTHENTICATED')fail('FORBIDDEN');if(r?.error?.code==='NOT_FOUND')fail('NOT_FOUND');fail('DEPENDENCY_UNAVAILABLE');}if(r.data?.contractVersion!==request.contractVersion)fail('DEPENDENCY_UNAVAILABLE');return r.data;
 }
 const same=a=>{if(a.issuer!==actor.issuer||a.subject!==actor.subject)fail('FORBIDDEN');};
 return {
  async allows(a,capability){same(a);const d=await call({contractVersion:'authorization.decision.v1',capability});if(d.subject!==actor.subject||d.capability!==capability||d.environment!==environment.environment||typeof d.allowed!=='boolean'||![d.decisionVersion,d.evaluatedAt,d.expiresAt].every(Number.isSafeInteger)||d.evaluatedAt>clock()||d.expiresAt<=clock()||d.expiresAt-d.evaluatedAt>5)fail('DEPENDENCY_UNAVAILABLE');return d.allowed;},
  async resolve(a,account,teamId){same(a);const d=await call({contractVersion:'directory.assignment.v1',action:'resolve',account,teamId});if(!/^[0-9a-f-]{36}$/i.test(d.subject)||typeof d.displayName!=='string'||d.displayName.length>100)fail('DEPENDENCY_UNAVAILABLE');return {subject:d.subject,displayName:d.displayName};},
  async search(a,query,limit=10,teamId,nextToken){same(a);const d=await call({contractVersion:'directory.assignment.v1',action:'search',query,limit,teamId,...(nextToken?{nextToken}:{})});if(!Array.isArray(d.items)||d.items.length>limit||Object.keys(d).some(k=>!['contractVersion','items','nextToken'].includes(k))||d.items.some(x=>!x||Object.keys(x).sort().join(',')!=='displayName,subject'||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(x.subject)||typeof x.displayName!=='string'||x.displayName.length>100)||(d.nextToken!==undefined&&(typeof d.nextToken!=='string'||d.nextToken.length>8192)))fail('DEPENDENCY_UNAVAILABLE');return {contractVersion:d.contractVersion,items:d.items.map(x=>({subject:x.subject,displayName:x.displayName})),...(d.nextToken?{nextToken:d.nextToken}:{})};}
 };
}
