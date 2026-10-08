import fs from 'node:fs';import {pin,save,E} from './aws.mjs';
const c=pin();save('pin',{at:new Date().toISOString(),productSha256:c.productSha256,securitySha256:c.securitySha256,zipSha256:c.zipSha256,sourceFilesVerified:true,freshSynthesis:false,awsWrites:0});
for(const name of ['preflight','preserve','check-retained']){const text=fs.readFileSync('scripts/core-2b5a/'+name+'.mjs','utf8');fs.writeFileSync('scripts/core-release1/'+name+'.mjs',text);}
