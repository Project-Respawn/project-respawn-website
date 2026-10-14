// Pure request compiler. This file cannot invoke AWS or accept arbitrary resources.
export const region='eu-north-1',account='058264289478';
export const bucket='amplify-projectrespawnweb-projectrespawnstoragebuc-ketz6kwxegaw';
export const reserved='__team_hub_fence_20261012_5dc9b3484c16415fa3dfc740';
export const logoKey='team-logos/'+reserved+'/absent.png';
export const tables=['Team','TeamMembership','TeamRosterSlot','PlayerChampionPoolEntry'].map(x=>x+'-dxb2tdlulrch7hj2pts2mfijia-NONE');
const guard={ConditionExpression:'attribute_exists(#id) AND attribute_not_exists(#id)',ExpressionAttributeNames:{'#id':'id'}};
export function directRequests(){return tables.flatMap(TableName=>{
 const Key={id:{S:reserved}},Item={...Key,proof:{S:'nonbusiness-fence-guard'}};
 return [
  {api:'PutItem',action:'dynamodb:PutItem',input:{TableName,Item,...guard},safe:'CONTRADICTORY_CONDITION'},
  {api:'UpdateItem',action:'dynamodb:UpdateItem',input:{TableName,Key,...guard,UpdateExpression:'SET #proof = :value',ExpressionAttributeNames:{...guard.ExpressionAttributeNames,'#proof':'proof'},ExpressionAttributeValues:{':value':{S:'nonbusiness-fence-guard'}}},safe:'CONTRADICTORY_CONDITION'},
  {api:'DeleteItem',action:'dynamodb:DeleteItem',input:{TableName,Key,...guard},safe:'CONTRADICTORY_CONDITION'},
  {api:'TransactWriteItems',action:'dynamodb:PutItem',input:{TransactItems:[{Put:{TableName,Item,...guard}}]},safe:'CONTRADICTORY_CONDITION'},
  {api:'BatchWriteItem',action:'dynamodb:BatchWriteItem',input:{RequestItems:{[TableName]:[{DeleteRequest:{Key}}]}},safe:'RESERVED_ABSENT_KEY_REQUIRED'},
  {api:'ExecuteStatement',action:'dynamodb:PartiQLUpdate',input:{Statement:`UPDATE "${TableName}" SET "proof"=? WHERE "id"=? AND "proof"=? AND "proof"<>?`,Parameters:[{S:'nonbusiness-fence-guard'},{S:reserved},{S:'impossible'},{S:'impossible'}]},safe:'CONTRADICTORY_CONDITION_REQUIRES_SERVICE_SYNTAX_CONTROL'},
  {api:'ExecuteStatement',action:'dynamodb:PartiQLDelete',input:{Statement:`DELETE FROM "${TableName}" WHERE "id"=? AND "proof"=? AND "proof"<>?`,Parameters:[{S:reserved},{S:'impossible'},{S:'impossible'}]},safe:'CONTRADICTORY_CONDITION_REQUIRES_SERVICE_SYNTAX_CONTROL'},
 ];
});}
export function logoRequests(){return [
 {api:'PutObject',action:'s3:PutObject',input:{Bucket:bucket,Key:logoKey,Body:'nonbusiness-fence-guard',IfMatch:'"00000000000000000000000000000000"',ExpectedBucketOwner:account},safe:'RESERVED_ABSENT_KEY_AND_IF_MATCH_REQUIRED'},
 {api:'DeleteObject',action:'s3:DeleteObject',input:{Bucket:bucket,Key:logoKey,IfMatch:'*',ExpectedBucketOwner:account},safe:'RESERVED_ABSENT_KEY_REQUIRED'},
 {api:'DeleteObject',action:'s3:DeleteObjectVersion',input:{Bucket:bucket,Key:logoKey,VersionId:'null',ExpectedBucketOwner:account},safe:'RESERVED_KEY_ALL_VERSIONS_ABSENT_REQUIRED'},
 {api:'AbortMultipartUpload',action:'s3:AbortMultipartUpload',input:{Bucket:bucket,Key:logoKey,UploadId:'fence-proof-no-existing-upload',ExpectedBucketOwner:account},safe:'RESERVED_KEY_ALL_UPLOADS_ABSENT_REQUIRED'},
 ];}
export function requireProbeResult(phase,response){
 if(phase==='FROZEN'){if(response.policyDenied!==true||!response.requestId||!response.principal||response.validationDenied||response.identityOnlyDenied)throw Error('FENCE_NOT_PROVEN');return true;}
 if(phase!=='PRE_FENCE')throw Error('INVALID_PHASE');
 if(!response.reachedService||response.validationDenied||response.identityOnlyDenied||response.changedBusinessState)throw Error('POSITIVE_CONTROL_NOT_PROVEN');return true;
}
