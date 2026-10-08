import assert from 'node:assert/strict';import {aws,pin,save,E,P,identity} from './aws.mjs';
const c=pin();await identity();const objects=[];
for(const [key,file,sha] of [[c.key,P+'/c2-product.template.json',c.productSha256]]){
 const checksum=Buffer.from(sha,'hex').toString('base64');let h,created=false;try{h=await aws('s3api','head-object',{Bucket:c.bucket,Key:key,ChecksumMode:'ENABLED'});}catch(error){assert.match(error.message,/404|NotFound/);}
 if(!h){await aws('s3api','put-object',{Bucket:c.bucket,Key:key,Body:file,ServerSideEncryption:'AES256',ChecksumSHA256:checksum});created=true;h=await aws('s3api','head-object',{Bucket:c.bucket,Key:key,ChecksumMode:'ENABLED'});}
 assert.equal(h.ServerSideEncryption,'AES256');assert.equal(h.ChecksumSHA256,checksum);objects.push({key,sha256:sha,encryption:h.ServerSideEncryption,created});
}
save('publication',{at:new Date().toISOString(),verified:true,objects});console.log(JSON.stringify({verified:true,objects:1}));
