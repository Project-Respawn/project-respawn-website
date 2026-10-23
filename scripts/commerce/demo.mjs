import { build } from 'esbuild'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
// Blocks outbound provider/AWS networking; localhost HTTP serving remains possible.
import http from 'node:http'; import https from 'node:https'
const deny=()=>{throw Error('Offline checkout forbids outbound requests')}
globalThis.fetch=deny;http.request=deny;http.get=deny;https.request=deny;https.get=deny
const require=createRequire(import.meta.url),root=process.cwd()
await fs.mkdir('.amplify/checkout-demo',{recursive:true})
await build({entryPoints:['scripts/commerce/offline-fixture.ts'],outfile:'.amplify/checkout-demo/fixture.mjs',bundle:true,platform:'node',format:'esm',target:'node22',inject:[path.join(path.dirname(require.resolve('@aws-amplify/backend-function')),'lambda-shims/cjs_shim.js')]})
const{offlineCheckoutFixture}=await import(pathToFileURL(path.resolve('.amplify/checkout-demo/fixture.mjs')).href)
const fixture=offlineCheckoutFixture()
const middleware={name:'offline-commerce',configureServer(server){server.middlewares.use(async(req,res,next)=>{
  if(!req.url?.startsWith('/__commerce_demo/'))return next()
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store')
  if(req.headers.origin&&req.headers.origin!=='http://127.0.0.1:5187'){res.statusCode=403;res.end('{}');return}
  try{
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>20000)throw Error('Request too large')}
    const body=raw?JSON.parse(raw):{},url=req.url.slice('/__commerce_demo'.length)
    if(url==='/commerce/orders/config'&&req.method==='GET'){res.end(JSON.stringify({seller:'Ravens Community',brand:'Project Respawn',checkoutEnabled:true,destinations:['GB'],currencies:['GBP','EUR','USD'],shippingMinor:0,pricesIncludeTax:true}));return}
    if(url==='/fixture/complete'&&req.method==='POST'){await fixture.complete(body.id);res.end('{}');return}
    const result=await fixture.http(url,req.method,body,{headers:req.headers});res.statusCode=result.statusCode;res.end(result.body)
  }catch{res.statusCode=503;res.end(JSON.stringify({error:'OFFLINE_FIXTURE_UNAVAILABLE'}))}
})}}
const server=await createServer({root,configFile:false,plugins:[vue(),middleware],define:{'import.meta.env.VITE_COMMERCE_DEMO':JSON.stringify('1')},resolve:{alias:{'@':path.join(root,'src')}},server:{host:'127.0.0.1',port:5187,strictPort:true,open:false}})
await server.listen()
console.log('OFFLINE FIXTURES ONLY: http://127.0.0.1:5187/checkout-demo.html — use GB postcode TEST1; no real payment or fulfilment requests.')
