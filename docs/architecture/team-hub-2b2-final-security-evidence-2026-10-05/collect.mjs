import {aws,read,save,prior} from './read-aws.mjs';
const identity=await aws('sts','get-caller-identity');
if(identity.Account!=='058264289478'||identity.Arn!=='arn:aws:iam::058264289478:user/RavenTest')throw Error('Unexpected identity');save('identity',identity);
const resources=read('docs/architecture/team-hub-2b2-evidence-2026-10-05/read-proof.template.json').Resources;
const types=[...new Set(Object.values(resources).map(r=>r.Type))];let cursor=0;
await Promise.all(Array.from({length:3},async()=>{while(cursor<types.length){const type=types[cursor++];try{const response=await aws('cloudformation','describe-type','--type','RESOURCE','--type-name',type);save('schema-'+type.replaceAll('::','-'),{...response,Schema:JSON.parse(response.Schema)});console.log(type+' read');}catch(e){save('schema-error-'+type.replaceAll('::','-'),{type,error:e.stderr??e.message});console.log(type+' schema error');}}}));
const [v2,v1]=await Promise.all([aws('apigatewayv2','get-apis'),aws('apigateway','get-rest-apis')]);save('current-api-inventory',{at:new Date().toISOString(),identity,v2:v2.Items,v1:v1.items});
const old=read(prior+'/inventory.json');const current=[...v2.Items.map(a=>a.ApiId),...v1.items.map(a=>a.id)].sort();if(JSON.stringify(current)!==JSON.stringify([...old.protectedIds].sort()))throw Error('Protected API inventory changed');
