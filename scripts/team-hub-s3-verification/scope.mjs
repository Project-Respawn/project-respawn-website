import fs from 'node:fs';import crypto from 'node:crypto';
export const E='docs/architecture/team-hub-s3-verification-evidence-2026-10-13';
export const ACCOUNT='058264289478',REGION='eu-north-1',OWNER='arn:aws:iam::058264289478:user/RavenTest';
export const RACE_BUCKET='respawn-teamhub-fence-race-058264289478-20261012-5dc9b348',KEY='team-logos/isolated-inflight-proof/zero-body.bin';
export const AUDIT_BUCKET='respawn-teamhub-quarantine-audit-058264289478-20261013';
export const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
export function validateApproval(receipt,manifestBytes,now=Date.now()){
 if(receipt?.packageSha256!==digest(manifestBytes)||receipt?.operator!==OWNER||receipt?.account!==ACCOUNT||receipt?.region!==REGION||receipt?.authorization!=='AUDIT_HELPER_ISOLATED_RACE_ONLY'||receipt?.acceptPhysicalLateCompletion!==true||receipt?.acceptUnboundedAuditDelivery!==true||receipt?.noCutoverAuthority!==true||!Number.isFinite(Date.parse(receipt?.expiresAt))||Date.parse(receipt.expiresAt)<=now)throw Error('SEPARATE_EXACT_AUTHORIZATION_REQUIRED');
 return true;
}
export function validateTerminal(r){if(!r?.status||!r?.requestId||!['SUCCEEDED','DENIED'].includes(r?.classification))throw Error('UNKNOWN_TERMINAL_RESULT');return true;}
export function validateOwnedBody(bytes){if(bytes.length!==65536||digest(bytes)!==digest(Buffer.alloc(65536)))throw Error('UNEXPECTED_OBJECT_PRESERVE_AND_STOP');return true;}
export function assertPinned(p){for(const a of p.artifacts)if(digest(fs.readFileSync(a.path))!==a.sha256)throw Error('ARTIFACT_DRIFT:'+a.path);return true;}
