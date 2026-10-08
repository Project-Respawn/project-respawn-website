import fs from 'node:fs';import assert from 'node:assert/strict';import {aws,pin,read,save,E} from './aws.mjs';
const c=pin(),failure=read('STOP');assert.equal(failure.service,'s3api');assert.equal(failure.code,255);
try{await aws('s3api','head-object',{Bucket:c.bucket,Key:c.assetKey});throw Error('OBJECT_EXISTS_INSPECT_BEFORE_RETRY');}catch(error){assert.match(error.message,/404/);}
save('publication-client-failure',{...failure,objectAbsent:true,correction:'Use AWS CLI streaming --body file argument rather than JSON Body string'});fs.unlinkSync(E+'/STOP.json');console.log(JSON.stringify({objectAbsent:true,clientSerializationCorrected:true}));
