import fs from 'node:fs';
export {aws,read,sha,canonical} from '../team-hub-recovery-execution/aws.mjs';
export const B='docs/architecture/team-hub-recovery-decision-evidence-2026-10-09',X='docs/architecture/team-hub-recovery-execution-evidence-2026-10-09',E='docs/architecture/team-hub-qualified-recovery-evidence-2026-10-09';
export function save(name,value){fs.mkdirSync(E,{recursive:true});fs.writeFileSync(E+'/'+name+'.json',JSON.stringify(value,null,2)+'\n');}
