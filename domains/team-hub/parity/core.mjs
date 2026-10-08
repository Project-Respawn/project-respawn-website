import {fail} from '../contracts.mjs';
import {verifyScope} from './fence.mjs';
export class VerificationCore {
 constructor(config,teamId,clock){this.config=config;this.teamId=teamId;this.clock=clock;}
 check(actor){verifyScope(this.config,actor,this.teamId,this.clock());}
 allows(actor,capability){this.check(actor);return capability==='teams.admin'&&this.config.administratorSubjects?.includes(actor.subject)===true;}
 resolve(actor,account){this.check(actor);const a=this.config.accounts.find(a=>a.account===account);if(!a)fail('NOT_FOUND');return {subject:a.subject,displayName:a.displayName};}
 search(actor,query,limit=10){this.check(actor);return this.config.accounts.filter(a=>a.displayName.toLowerCase().includes(query.toLowerCase())).slice(0,Math.min(10,limit)).map(a=>({subject:a.subject,displayName:a.displayName}));}
}
export const liveCoreStatus=Object.freeze({environment:'ACCEPTED',directory:'NOT_IMPLEMENTED',authorization:'NOT_IMPLEMENTED',profile:'NOT_IMPLEMENTED'});
