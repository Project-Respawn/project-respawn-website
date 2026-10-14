// Offline reconciliation/decision model. It cannot modify source or target state.
import {createHash} from 'node:crypto';
export const prefix='team-logos/';
export const fingerprint=o=>createHash('sha256').update(JSON.stringify([o.key,o.versionId??'UNVERSIONED',o.etag,o.size,o.lastModified])).digest('hex');
export function reconcileObjects(baseline,current,{complete,prefix:scope=prefix}={}){
 if(!complete||scope!==prefix)throw Error('INCOMPLETE_QUARANTINE_SCAN');
 for(const o of [...baseline,...current])if(!o.key?.startsWith(prefix)||!o.etag||!Number.isSafeInteger(o.size)||!o.lastModified)throw Error('INVALID_OBJECT_METADATA');
 const old=new Map(baseline.map(o=>[o.key+'\0'+(o.versionId??''),fingerprint(o)]));
 return current.filter(o=>old.get(o.key+'\0'+(o.versionId??''))!==fingerprint(o)).map(o=>({keyHash:createHash('sha256').update(o.key).digest('hex'),fingerprint:fingerprint(o),decision:'QUARANTINED_NO_ASSOCIATION',autoDelete:false}));
}
export function requireLogicalContainment(r){for(const f of ['sourceObjectFenceInstalled','sourceMetadataFenceProven','targetBrandingDisabled','targetHasNoLegacyS3Access','noAutomaticImport','displayAdapterSuppressesSourceUrls','privilegedPolicyCustody'])if(r?.[f]!==true)throw Error('LOGICAL_CONTAINMENT_UNPROVEN:'+f);return true;}
export function requireObservation(r){if(!r?.completeListings||!r?.auditCoverageVerified||!r?.allDeliveredWriteEventsReconciled||r?.unresolvedAssociations!==0||r?.missedPolls!==0||r?.observationMinutes<30||!r?.ongoingCustodian)throw Error('OBSERVATION_INCOMPLETE');return true;}
export function cleanupFixture(expected,actual){if(!expected?.synthetic||expected.key!==actual?.key||expected.digest!==actual?.digest||actual?.terminal!==true)throw Error('UNSAFE_CLEANUP');return true;}
