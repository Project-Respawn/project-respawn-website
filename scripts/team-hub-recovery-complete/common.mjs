import fs from 'node:fs';
export {aws,read,sha,canonical} from '../team-hub-kms-lifecycle/aws.mjs';
export const E='docs/architecture/team-hub-complete-recovery-evidence-2026-10-11',L='docs/architecture/team-hub-kms-lifecycle-evidence-2026-10-10',B='docs/architecture/team-hub-recovery-decision-evidence-2026-10-09',Q='docs/architecture/team-hub-qualified-recovery-evidence-2026-10-09';
export function save(name,value){fs.mkdirSync(E,{recursive:true});fs.writeFileSync(E+'/'+name+'.json',JSON.stringify(value,null,2)+'\n');}
