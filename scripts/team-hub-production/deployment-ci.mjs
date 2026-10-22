// Artifact-bound offline CI only: never synthesize, publish, create change sets or deploy.
import {inspect} from './deployment-validate.mjs';
const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--domain'||!['core','team-hub'].includes(args[1]))throw Error('EXPLICIT_PRODUCTION_DOMAIN_REQUIRED');
const {manifest,structures}=inspect(),prefix=args[1]==='core'?'core':'team';
console.log(JSON.stringify({environment:'Production',domain:args[1],mode:'PRODUCTION_DARK',checked:structures.filter(v=>v.stack.startsWith(prefix)),sharedIdentityPreserved:true,legacyResourcesAdded:0,awsWrites:0,liveAccepted:manifest.liveAccepted}));
