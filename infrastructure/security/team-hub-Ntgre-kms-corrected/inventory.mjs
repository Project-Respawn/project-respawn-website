import {aws,read,save,previous} from './read-aws.mjs';
const identity=await aws('sts','get-caller-identity');
if(identity.Account!=='058264289478'||identity.Arn!=='arn:aws:iam::058264289478:user/RavenTest')throw Error('Wrong AWS identity');save('identity',identity);
const [listed,aliases,encryption,v2,v1]=await Promise.all([aws('kms','list-keys'),aws('kms','list-aliases'),aws('s3api','get-bucket-encryption','--bucket','cdk-hnb659fds-assets-058264289478-eu-north-1'),aws('apigatewayv2','get-apis'),aws('apigateway','get-rest-apis')]);
const currentIds=[...v2.Items.map(a=>a.ApiId),...v1.items.map(a=>a.id)].sort();
if(JSON.stringify(currentIds)!==JSON.stringify([...read(previous+'/inventory.json').protectedIds].sort()))throw Error('Protected API inventory changed');save('api-inventory',{at:new Date().toISOString(),v2:v2.Items,v1:v1.items,protectedIds:currentIds});
const product=read(read(previous+'/manifest.json').productTemplate.path),fn=product.Resources.ReadFunction.Properties;
const bucket=fn.Code.S3Bucket,key=fn.Code.S3Key;
let object,bucketPolicy;
try{object={exists:true,metadata:await aws('s3api','head-object','--bucket',bucket,'--key',key,'--query','{ServerSideEncryption:ServerSideEncryption,SSEKMSKeyId:SSEKMSKeyId,ContentLength:ContentLength,ETag:ETag,VersionId:VersionId}')}}catch(e){if(/\(404\)|Not Found|NoSuchKey/.test(e.stderr??''))object={exists:false,status:'404',published:false};else throw e;}
try{bucketPolicy=JSON.parse((await aws('s3api','get-bucket-policy','--bucket',bucket)).Policy)}catch(e){if(/NoSuchBucketPolicy/.test(e.stderr??''))bucketPolicy={status:'NoSuchBucketPolicy'};else throw e;}
save('artifact-encryption',{at:new Date().toISOString(),bucket,key,bucketEncryption:encryption,bucketPolicy,object,publicationPerformed:false,plannedPublicationEncryption:'AES256 (SSE-S3), explicitly required; verify final object headers before execution',lambdaKmsKeyArn:fn.KmsKeyArn??null,customerManagedLambdaKeyConfigured:!!fn.KmsKeyArn});
const keys=[];let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<listed.Keys.length){const k=listed.Keys[cursor++];const metadata=(await aws('kms','describe-key','--key-id',k.KeyId)).KeyMetadata;
 const keyAliases=aliases.Aliases.filter(a=>a.TargetKeyId===k.KeyId).map(a=>a.AliasName);
 const policy=JSON.parse((await aws('kms','get-key-policy','--key-id',k.KeyId,'--policy-name','default')).Policy);
 const tags=metadata.KeyManager==='CUSTOMER'?(await aws('kms','list-resource-tags','--key-id',k.KeyId)).Tags:[];
 const grants=metadata.KeyManager==='CUSTOMER'?(await aws('kms','list-grants','--key-id',k.KeyId)).Grants:null;
 const business=tags.some(t=>/Twitch|Overlay/i.test(t.TagValue))||keyAliases.some(a=>/twitch|overlay/i.test(a));
 const artifactKey=encryption.ServerSideEncryptionConfiguration.Rules.some(r=>r.ApplyServerSideEncryptionByDefault.SSEAlgorithm==='aws:kms'&&[metadata.Arn,metadata.KeyId,...keyAliases].includes(r.ApplyServerSideEncryptionByDefault.KMSMasterKeyID));
 const classification=metadata.KeyManager==='AWS'?(keyAliases.includes('alias/aws/lambda')?'AWS_MANAGED_LAMBDA_KEY':'AWS_MANAGED_SERVICE_KEY'):artifactKey?'DEPLOYMENT_ARTIFACT_KEY':business?'PROJECT_RESPAWN_BUSINESS_KEY':'UNKNOWN_CUSTOMER_MANAGED_KEY';
 keys.push({id:metadata.KeyId,arn:metadata.Arn,manager:metadata.KeyManager,state:metadata.KeyState,aliases:keyAliases,tags,classification,policy,grants,grantsInspected:metadata.KeyManager==='CUSTOMER'});
}}));
keys.sort((a,b)=>a.id.localeCompare(b.id));const lambda=keys.filter(k=>k.classification==='AWS_MANAGED_LAMBDA_KEY');if(lambda.length!==1)throw Error('Unique AWS-managed Lambda alias/key required');
save('key-inventory',{at:new Date().toISOString(),identity,region:'eu-north-1',keys,lambdaKeyArn:lambda[0].arn,counts:keys.reduce((s,k)=>(s[k.classification]=(s[k.classification]??0)+1,s),{}),awsWrites:0});
console.log(JSON.stringify({keys:keys.length,lambdaKey:lambda[0].arn,counts:keys.reduce((s,k)=>(s[k.classification]=(s[k.classification]??0)+1,s),{}),artifactExists:object.exists,bucketEncryption:encryption.ServerSideEncryptionConfiguration}));
