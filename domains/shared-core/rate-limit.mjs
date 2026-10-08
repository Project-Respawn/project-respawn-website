import {CoreError} from './contracts.mjs';
// Best-effort actor brake per warm execution environment. Reserved concurrency
// bounds aggregate in-flight work; neither mechanism is a global billing quota.
export function directoryLimiter({clock=()=>Date.now(),limit=30,maxActors=1000}={}){
 const actors=new Map();return subject=>{const now=clock();for(const [key,value]of actors)if(value.until<=now)actors.delete(key);let b=actors.get(subject);if(!b){if(actors.size>=maxActors)throw new CoreError('RATE_LIMITED');b={until:now+60000,count:0};actors.set(subject,b);}if(++b.count>limit)throw new CoreError('RATE_LIMITED');};
}
