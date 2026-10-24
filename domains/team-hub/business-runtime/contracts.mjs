import * as base from '../contracts.mjs';
import {assignablePermissions} from '../structure/feature-permissions.mjs';
export * from '../contracts.mjs';
const search=structuredClone(base.operations.SEARCH_TEAM_ASSIGNABLE_USERS);
search.request.properties.nextToken={type:'string',minLength:1,maxLength:4096};
search.response.properties.nextToken={type:'string',minLength:1,maxLength:4096};
const list=structuredClone(base.operations.LIST_MY_TEAMS),context=structuredClone(base.operations.GET_TEAM_HUB);
for(const spec of [list,context]){spec.response.properties.capabilities={type:'object',additionalProperties:false,properties:{teamsAdmin:{type:'boolean'},brandingManage:{const:false}},required:['teamsAdmin','brandingManage']};spec.response.required.push('capabilities');}
const resolve={method:'POST',path:'/v1/directory/assignable-resolve',runtime:'read',authorization:'MANAGER or teams.admin',request:{type:'object',additionalProperties:false,properties:{teamId:base.schemas.teamId,account:{type:'string',minLength:3,maxLength:254}},required:['teamId','account']},response:{type:'object',additionalProperties:false,properties:{subject:base.schemas.subject,displayName:{type:'string',minLength:1,maxLength:100},membershipVersion:{type:'integer',minimum:0,maximum:Number.MAX_SAFE_INTEGER}},required:['subject','displayName','membershipVersion']}};
const object=(properties)=>({type:'object',additionalProperties:false,properties,required:Object.keys(properties)});
const permissions={type:'array',items:{type:'string',enum:assignablePermissions},maxItems:assignablePermissions.length};
context.response.properties.capabilities.properties.permissionContract={const:'team-hub.permissions.v1'};
context.response.properties.capabilities.properties.memberPermissions=permissions;
const grant=object({membershipId:base.schemas.membershipId,permissions,version:{type:'integer',minimum:1,maximum:Number.MAX_SAFE_INTEGER}});
const getPermissions={method:'GET',path:'/v1/teams/{teamId}/permissions',runtime:'read',authorization:'Manager, Head Coach or teams.admin',request:object({teamId:base.schemas.teamId}),response:object({permissionContract:{const:'team-hub.permissions.v1'},team:base.teamDTO,members:{type:'array',items:grant,maxItems:50}})};
const setPermissions={method:'PUT',path:'/v1/teams/{teamId}/permissions/{membershipId}',runtime:'command',authorization:getPermissions.authorization,request:structuredClone(base.operations.SET_ROSTER_SLOT.request),response:object({team:base.teamDTO,grant})};
for(const key of ['gameRoleKey','slotType','action','expectedRosterVersion']){delete setPermissions.request.properties[key];setPermissions.request.required=setPermissions.request.required.filter(k=>k!==key);}
setPermissions.request.properties.permissions=permissions;setPermissions.request.required.push('permissions');
export const operations=Object.freeze({...base.operations,SEARCH_TEAM_ASSIGNABLE_USERS:search,RESOLVE_TEAM_ASSIGNABLE_USER:resolve,LIST_MY_TEAMS:list,GET_TEAM_HUB:context,GET_TEAM_PERMISSIONS:getPermissions,SET_MEMBER_PERMISSIONS:setPermissions});
const extended=['SEARCH_TEAM_ASSIGNABLE_USERS','RESOLVE_TEAM_ASSIGNABLE_USER','LIST_MY_TEAMS','GET_TEAM_HUB','GET_TEAM_PERMISSIONS','SET_MEMBER_PERMISSIONS'];
export function validateRequest(op,request){if(!extended.includes(op))return base.validateRequest(op,request);if(!base.valid(operations[op].request,request))base.fail('INVALID_INPUT');return request;}
export function validateResponse(op,response){if(!extended.includes(op))return base.validateResponse(op,response);if(!base.valid(operations[op].response,response))throw Error('Invalid cutover projection');return response;}
