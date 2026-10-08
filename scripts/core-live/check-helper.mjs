import {read,E} from './aws.mjs';
const h=read(E+'/local-helper.json'),r=await fetch(h.url,{signal:AbortSignal.timeout(15000)}),html=await r.text(),proxy=html.match(/src="([^"]*html-proxy[^"]*)"/)?.[1];
const result={status:r.status,signInForm:html.includes('id="signin"'),hasPasswordField:html.includes('type="password"'),moduleProxyPresent:Boolean(proxy)};
console.log(JSON.stringify(result));
if(proxy){const module=await fetch(new URL(proxy,h.url),{signal:AbortSignal.timeout(15000)}),text=await module.text();result.moduleStatus=module.status;result.importsTransformed=text.includes('/node_modules/');result.hasSignInHandler=text.includes('onsubmit');}
console.log(JSON.stringify(result));
