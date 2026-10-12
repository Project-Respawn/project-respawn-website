import assert from 'node:assert/strict';
import {aws,pin,save,identity} from './execution.mjs';
const c=pin();await identity();const checksum=Buffer.from(c.securitySha256,'hex').toString('base64');
let h,created=false;try{h=await aws('s3api','head-object',{Bucket:c.bucket,Key:c.securityKey,ChecksumMode:'ENABLED'});}catch(e){assert.match(e.message,/404|NotFound/);}
if(!h){await aws('s3api','put-object',{Bucket:c.bucket,Key:c.securityKey,Body:c.root+'/security.template.json',ServerSideEncryption:'AES256',ChecksumSHA256:checksum});created=true;h=await aws('s3api','head-object',{Bucket:c.bucket,Key:c.securityKey,ChecksumMode:'ENABLED'});}
assert.equal(h.ServerSideEncryption,'AES256');assert.equal(h.ChecksumSHA256,checksum);
save('security-publication',{at:new Date().toISOString(),verified:true,key:c.securityKey,url:c.securityUrl,sha256:c.securitySha256,encryption:h.ServerSideEncryption,created,reason:'Exact pinned security bytes exceed 51200-byte TemplateBody limit; use TemplateURL without reformatting or changing the pin.'});
console.log(JSON.stringify({verified:true,key:c.securityKey}));
