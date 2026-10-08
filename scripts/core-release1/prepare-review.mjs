import fs from 'node:fs';import {P,E,pin} from './aws.mjs';
pin();for(const n of ['runtime-policy','runtime-boundary','caller-policy','execution-policy','executionBoundary-policy','candidate'])fs.copyFileSync(P+'/'+n+'.json',E+'/'+n+'.json');
for(const [source,dest]of [['review-security','policy-matrix'],['logging-review','logging-inclusion']]){const code=fs.readFileSync('scripts/core-2b5a/'+source+'.mjs','utf8').replaceAll("from './policies.mjs'","from '../core-2b5a/policies.mjs'");fs.writeFileSync('scripts/core-release1/'+dest+'.mjs',code);}
