// Proposed authenticated read-only contract. Not installed in the D1 runtime.
export const AUTHORITY_VERSION='team-hub.authority-status.v1';
export const AUTHORITY_PATH='/v1/authority';
export function validateAuthority(value,environment,now=Date.now()){
 const fields=['contractVersion','domain','environment','account','region','mode','epoch','version','observedAt'];
 if(!value||Object.keys(value).sort().join('|')!==fields.sort().join('|')||value.contractVersion!==AUTHORITY_VERSION||value.domain!=='TeamHub'||value.environment!==environment.environment||value.account!==environment.account||value.region!==environment.region||!['LEGACY_WRITER','FROZEN','TARGET_WRITER'].includes(value.mode)||!Number.isSafeInteger(value.epoch)||value.epoch<1||!Number.isSafeInteger(value.version)||value.version<1||typeof value.observedAt!=='string')throw Error('INVALID_AUTHORITY_CONTRACT');
 const observed=Date.parse(value.observedAt);if(!Number.isFinite(observed)||observed>now+5000||now-observed>30000)throw Error('STALE_AUTHORITY');
 return Object.freeze({...value});
}
