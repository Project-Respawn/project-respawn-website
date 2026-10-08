import fs from 'node:fs';
import {transform,reconcile,reverse} from './transform.mjs';
import {fixture,options} from './fixtures.mjs';
// Deliberately no output path or write mode: payloads never leave process memory.
const args=process.argv.slice(2);
let input;
if(args.length===1&&args[0]==='--synthetic')input=fixture();
else if(args.length===1&&args[0]==='--empty')input={};
else if(args.length===2&&args[0]==='--input'){try{input=JSON.parse(fs.readFileSync(args[1],'utf8'));}catch{throw Error('Cannot read/parse normalized source; payload withheld');}}
else throw Error('Use --synthetic, --empty, or --input <access-controlled normalized JSON>; no live writes/output payload supported');
const r=transform(input,options);
console.log(JSON.stringify({summary:r.summary,reconciliation:reconcile(input,r.items,options),reverseRoundTrip:r.summary.accepted?JSON.stringify(reverse(r.items,r.recovery,options))===JSON.stringify(r.recovery):false,checkpoint:r.checkpoint,noWrites:true},null,2));
if(!r.summary.accepted)process.exitCode=1;
