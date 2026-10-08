import * as base from '../contracts.mjs';
export * from '../contracts.mjs';
const search=structuredClone(base.operations.SEARCH_TEAM_ASSIGNABLE_USERS);
search.request.properties.nextToken={type:'string',minLength:1,maxLength:4096};
search.response.properties.nextToken={type:'string',minLength:1,maxLength:4096};
const list=structuredClone(base.operations.LIST_MY_TEAMS),context=structuredClone(base.operations.GET_TEAM_HUB);
for(const spec of [list,context]){spec.response.properties.capabilities={type:'object',additionalProperties:false,properties:{teamsAdmin:{type:'boolean'},brandingManage:{const:false}},required:['teamsAdmin','brandingManage']};spec.response.required.push('capabilities');}
const resolve={method:'POST',path:'/v1/directory/assignable-resolve',runtime:'read',authorization:'MANAGER or teams.admin',request:{type:'object',additionalProperties:false,properties:{teamId:base.schemas.teamId,account:{type:'string',minLength:3,maxLength:254}},required:['teamId','account']},response:{type:'object',additionalProperties:false,properties:{subject:base.schemas.subject,displayName:{type:'string',minLength:1,maxLength:100},membershipVersion:{type:'integer',minimum:0,maximum:Number.MAX_SAFE_INTEGER}},required:['subject','displayName','membershipVersion']}};
export const operations=Object.freeze({...base.operations,SEARCH_TEAM_ASSIGNABLE_USERS:search,RESOLVE_TEAM_ASSIGNABLE_USER:resolve,LIST_MY_TEAMS:list,GET_TEAM_HUB:context});
export function validateRequest(op,request){if(!['SEARCH_TEAM_ASSIGNABLE_USERS','RESOLVE_TEAM_ASSIGNABLE_USER'].includes(op))return base.validateRequest(op,request);if(!base.valid(operations[op].request,request))base.fail('INVALID_INPUT');return request;}
export function validateResponse(op,response){if(!['SEARCH_TEAM_ASSIGNABLE_USERS','RESOLVE_TEAM_ASSIGNABLE_USER','LIST_MY_TEAMS','GET_TEAM_HUB'].includes(op))return base.validateResponse(op,response);if(!base.valid(operations[op].response,response))throw Error('Invalid cutover projection');return response;}
