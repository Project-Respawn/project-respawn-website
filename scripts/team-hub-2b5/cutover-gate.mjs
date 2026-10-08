import assert from 'node:assert/strict';
export function gate(e,{now=Date.now(),afterFreeze=false}={}){
 const failures=[];
 if(!Array.isArray(e.sourceCounts)||e.sourceCounts.length!==4||e.sourceCounts.some(n=>n!==0)||e.logos!==0)failures.push('STOP_MODE_B');
 if(e.operational!==0||e.idempotency!==0||e.auditCount!==15||e.retainedAuditReceiptMatched!==true)failures.push('TARGET_NOT_RECONCILED');
 if(!Number.isFinite(e.observedAt)||e.observedAt>now||now-e.observedAt>60000)failures.push('STALE_COUNTS');
 for(const k of ['consistentCompleteCounts','sourceProtected','targetProtected','backupsAvailable','coverageRefreshed','coreLiveAccepted','legacyFenceProved','targetFenceProved','frontendReady','rollbackReady','privilegedFreeze','compatibilityReady'])if(e[k]!==true)failures.push(k);
 if(e.unknownWriters!==0||e.unknownReaders!==0)failures.push('UNKNOWN_CONSUMERS');
 if(e.authority!==(afterFreeze?'FROZEN':'LEGACY_WRITER'))failures.push('WRONG_AUTHORITY');
 if(afterFreeze&&!e.inFlightDrained)failures.push('INFLIGHT_NOT_DRAINED');
 return {ready:failures.length===0,failures,mode:failures.includes('STOP_MODE_B')?'MODE_B_REQUIRED':'MODE_A_CONDITIONAL',execute:false};
}
export function transition(current,next,proof){
 assert.ok(['LEGACY_WRITER','FROZEN','TARGET_WRITER'].includes(current.mode));
 assert.ok((current.mode==='LEGACY_WRITER'||current.mode==='TARGET_WRITER')?next==='FROZEN':next==='TARGET_WRITER'||next==='LEGACY_WRITER');
 assert.ok(proof?.reviewed&&/^[a-f0-9]{64}$/.test(proof.gateDigest));
 if(next==='TARGET_WRITER')assert.ok(proof.afterFreezeGate?.ready);
 if(next==='LEGACY_WRITER')assert.ok(proof.reverseReconciled&&proof.oldProtocolReplayDenied);
 return {expected:{mode:current.mode,epoch:current.epoch,version:current.version},next:{...current,mode:next,epoch:current.epoch+1,version:current.version+1,gateDigest:proof.gateDigest},execute:false};
}
