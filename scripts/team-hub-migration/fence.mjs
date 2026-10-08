// Offline protocol model only; not installed into any runtime/IAM policy.
const modes=['LEGACY_WRITER','FROZEN','TARGET_WRITER'];
export function authorize({mode,epoch,expectedEpoch,writer,inFlight=0}){return modes.includes(mode)&&Number.isSafeInteger(epoch)&&epoch>=0&&epoch===expectedEpoch&&inFlight>=0&&((mode==='LEGACY_WRITER'&&writer==='LEGACY')||(mode==='TARGET_WRITER'&&writer==='TARGET'));}
export function transition(current,next,{writersEnumerated=false,serverDenyVerified=false,inFlight=1,reconciled=false,backupsRestored=false}={}){
 if(!modes.includes(current.mode)||!modes.includes(next)||!Number.isSafeInteger(current.epoch))throw Error('Invalid fence');
 if(current.mode===next)throw Error('No transition');
 if(next==='FROZEN'){if(!writersEnumerated||!serverDenyVerified)throw Error('Uncovered writer');}
 else if(current.mode!=='FROZEN'||inFlight!==0||!reconciled||!backupsRestored||!writersEnumerated||!serverDenyVerified)throw Error('Unreconciled authority transition');
 return {mode:next,epoch:current.epoch+1};
}
