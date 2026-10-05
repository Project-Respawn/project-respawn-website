import fs from 'node:fs';
import assert from 'node:assert/strict';
import {aws,save,pins,expiry,hash,read,dir} from './common.mjs';
pins();expiry();assert.equal(read(dir+'/preflight.json').identity.Account,'058264289478');assert.equal(read(dir+'/legacy-after.json').beforeAfterEqual,true);assert.deepEqual(read(dir+'/tournament-baseline.json').issues,[]);
const bucket='cdk-hnb659fds-assets-058264289478-eu-north-1';
const files=[{path:'infrastructure/domains/team-hub/.build/offline-1791205212119/pinned-publication.zip',key:'da4d9e570523cbbdcff21572d059f18227d03c12482620e916752f2863b87da1.zip'},{path:'infrastructure/domains/team-hub/.build/offline-1791205212119/assembly/ProjectRespawn-TeamHub-Ntgre.template.json',key:'0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee.json'}];
const evidence=[];
for(const f of files){try{await aws('s3api','head-object','--bucket',bucket,'--key',f.key);throw Error('Existing object: stop rather than overwrite '+f.key);}catch(e){if(!/404|Not Found/.test(e.stderr??''))throw e;}
 const sha=hash(f.path),checksum=Buffer.from(sha,'hex').toString('base64');
 const result=await aws('s3api','put-object','--bucket',bucket,'--key',f.key,'--body',f.path,'--server-side-encryption','AES256','--checksum-algorithm','SHA256','--checksum-sha256',checksum,'--if-none-match','*');
 const head=await aws('s3api','head-object','--bucket',bucket,'--key',f.key,'--checksum-mode','ENABLED');assert.equal(head.ServerSideEncryption,'AES256');assert.equal(head.ChecksumSHA256,checksum);assert.equal(head.ContentLength,fs.statSync(f.path).size);
 evidence.push({bucket,...f,sha256:sha,result,head});save('published-assets',evidence);
}
console.log(JSON.stringify(evidence.map(e=>({bucket:e.bucket,key:e.key,sha256:e.sha256,encryption:e.head.ServerSideEncryption,etag:e.head.ETag}))));
