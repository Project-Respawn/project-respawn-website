export const CAPABILITIES=Object.freeze(['teams.admin','teams.branding.manage']);
export const CONTRACTS=Object.freeze(['authorization.decision.v1','directory.assignment.v1']);
export class CoreError extends Error {constructor(code){super(code);this.code=code;}}
export function requireCore(condition,code='INVALID_INPUT'){if(!condition)throw new CoreError(code);}
export function environmentContract(e){
 requireCore(e?.contractVersion==='environment.v1'&&e.environment==='Ntgre'&&e.account==='058264289478'&&e.region==='eu-north-1','WRONG_ENVIRONMENT');
 requireCore(/^eu-north-1_[A-Za-z0-9]+$/.test(e.poolId)&&/^[a-z0-9]{26}$/.test(e.clientId)&&e.issuer===`https://cognito-idp.eu-north-1.amazonaws.com/${e.poolId}`,'WRONG_ENVIRONMENT');
 return Object.freeze(Object.fromEntries(['contractVersion','environment','account','region','poolId','clientId','issuer'].map(k=>[k,e[k]])));
}
export function requestContract(input){
 requireCore(input&&typeof input==='object'&&!Array.isArray(input));
 const keys=['contractVersion','environment','accessToken','capability','action','teamId','query','account','limit','nextToken'];
 requireCore(Object.keys(input).every(k=>keys.includes(k))&&CONTRACTS.includes(input.contractVersion));
 requireCore(input.environment==='Ntgre','WRONG_ENVIRONMENT');
 requireCore(typeof input.accessToken==='string'&&input.accessToken.length>0&&input.accessToken.length<16000,'UNAUTHENTICATED');
 if(input.contractVersion==='authorization.decision.v1'){
  requireCore(CAPABILITIES.includes(input.capability));
  requireCore(Object.keys(input).every(k=>['contractVersion','environment','accessToken','capability'].includes(k)));
 }else{
  requireCore(['resolve','search'].includes(input.action)&&/^team:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.teamId));
  requireCore(!('capability'in input));
  if(input.action==='resolve')requireCore(typeof input.account==='string'&&input.account.length<=254&&/^[^\s@"\\]+@[^\s@"\\]+$/.test(input.account)&&!('query'in input)&&!('nextToken'in input)&&!('limit'in input));
  else requireCore(!('account'in input)&&typeof input.query==='string'&&/^[A-Za-z0-9@._+-]{2,100}$/.test(input.query)&&Number.isInteger(input.limit)&&input.limit>=1&&input.limit<=10&&(!input.nextToken||typeof input.nextToken==='string'&&input.nextToken.length<=4096));
 }
 return input;
}
