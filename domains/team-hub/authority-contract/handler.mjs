// Separately reviewable candidate only. No deployed entry imports this handler.
import {authenticate} from '../auth.mjs';
import {AUTHORITY_PATH,AUTHORITY_VERSION,validateAuthority} from './contract.mjs';
export function createAuthorityStatusHandler({getItem,environment,clock=Date.now}){
 return async event=>{
  const response=(statusCode,body)=>({statusCode,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(body)});
  if(event?.routeKey!=='GET '+AUTHORITY_PATH)return response(404,{error:{code:'NOT_FOUND'}});
  try{authenticate(event?.requestContext?.authorizer?.jwt?.claims,environment,Math.floor(clock()/1000));}catch{return response(401,{error:{code:'UNAUTHENTICATED'}});}
  if(event.body||event.rawQueryString||Object.keys(event.queryStringParameters??{}).length||Object.keys(event.pathParameters??{}).length)return response(400,{error:{code:'INVALID_REQUEST'}});
  try{
   const {Item:row}=await getItem({TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:{PK:'CONTROL#AUTHORITY',SK:'STATE'},ConsistentRead:true});
   const keys=['PK','SK','schemaVersion','mode','epoch','version','changedAt','changedBy','gateDigest'];
   if(!row||Object.keys(row).sort().join('|')!==keys.sort().join('|')||row.PK!=='CONTROL#AUTHORITY'||row.SK!=='STATE'||row.schemaVersion!=='team-hub-authority.v1'||typeof row.changedAt!=='string'||!Number.isFinite(Date.parse(row.changedAt))||typeof row.changedBy!=='string'||!row.changedBy||row.changedBy.length>200||typeof row.gateDigest!=='string'||!/^[a-f0-9]{64}$/.test(row.gateDigest))throw Error('INVALID_CONTROL');
   const body=validateAuthority({contractVersion:AUTHORITY_VERSION,domain:'TeamHub',environment:environment.environment,account:environment.account,region:environment.region,mode:row.mode,epoch:row.epoch,version:row.version,observedAt:new Date(clock()).toISOString()},environment,clock());
   return response(200,body);
  }catch{return response(503,{error:{code:'AUTHORITY_UNAVAILABLE'}});}
 };
}
