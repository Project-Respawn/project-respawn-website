import {operations,validateRequest,validateResponse,VERSION} from '../../../../domains/team-hub/cutover/contracts.mjs';
import {AUTHORITY_PATH,validateAuthority} from '../../../../domains/team-hub/authority-contract/contract.mjs';
// Dormant, explicit constructor. No global SDK or domain initialization.
export function createCutoverClient({manifest,core,activation,tokenProvider,fetcher=fetch,clock=Date.now}){
 if(core.contractVersion!=='environment.v1'||core.environment!=='Ntgre'||core.account!=='058264289478'||core.region!=='eu-north-1')throw Error('INVALID_ENVIRONMENT');
 if(manifest.domain!=='TeamHub'||manifest.environment!==core.environment||manifest.account!==core.account||manifest.region!==core.region||manifest.authMode!=='COGNITO_JWT_ACCESS_TOKEN'||manifest.status!=='DEPLOYED'||manifest.endpoint!==`https://${manifest.apiId}.execute-api.${core.region}.amazonaws.com`)throw Error('INVALID_ENDPOINT');
 if(activation?.mode!=='TARGET_WRITER'||activation.reviewed!==true||!Number.isSafeInteger(activation.epoch)||activation.epoch<1)throw Error('CUTOVER_NOT_AUTHORIZED');
 return Object.freeze({async call(op,request){
  if(['REQUEST_TEAM_LOGO_UPLOAD','COMMIT_TEAM_LOGO','REMOVE_TEAM_LOGO'].includes(op))throw Error('BRANDING_DISABLED');
  validateRequest(op,request);const spec=operations[op],body={...request},route=spec.path.replace(/\{([^}]+)\}/g,(_,k)=>{const value=body[k];delete body[k];return encodeURIComponent(value);});const url=new URL(route,manifest.endpoint);
  const token=await tokenProvider();if(!token)throw Error('UNAUTHENTICATED');
  const status=await fetcher(new URL(AUTHORITY_PATH,manifest.endpoint),{method:'GET',headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!status.ok)throw Error('AUTHORITY_UNAVAILABLE');
  const authority=validateAuthority(await status.json(),core,clock());
  if(authority.mode!=='TARGET_WRITER')throw Error('WRITER_NOT_AUTHORITATIVE');
  if(authority.epoch!==activation.epoch)throw Error('AUTHORITY_EPOCH_MISMATCH');
  const init={method:spec.method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','X-Team-Authority-Epoch':String(authority.epoch)},credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)};
  if(spec.method==='GET')for(const[k,v]of Object.entries(body))url.searchParams.set(k,String(v));else init.body=JSON.stringify(body);
  const response=await fetcher(url,init),result=await response.json();if(result.contractVersion!==VERSION)throw Error('INVALID_CONTRACT');if(!response.ok)throw Error(result.error?.code??'DEPENDENCY_UNAVAILABLE');return validateResponse(op,result.data);
 }});
}
