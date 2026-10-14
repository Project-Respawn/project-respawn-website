// Test harness only: load the actual downloaded deployment packages; no synthesis.
const fs=require('node:fs'),path=require('node:path');let offset=0;const realNow=Date.now;Date.now=()=>realNow()+offset;
const configurations=JSON.parse(fs.readFileSync(process.env.LOCAL_CONFIG_FILE));
function load(kind){Object.assign(process.env,configurations[kind]);return require(path.resolve('.tmp/team-hub-cursor-deployment/deployed-'+kind.toLowerCase()+'.cjs')).handler;}
const handlers={read:load('Read'),command:load('Command')};
process.on('message',async m=>{if(m.type==='offset'){offset=m.value;process.send({id:m.id,ok:true});return;}try{Object.assign(process.env,configurations[m.runtime==='read'?'Read':'Command']);const response=await handlers[m.runtime](m.event);process.send({id:m.id,response});}catch(e){process.send({id:m.id,error:e.message});}});
process.send({ready:true});
