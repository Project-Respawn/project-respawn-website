import {aws,save,pins,expiry,pinned} from './common.mjs';
pins();const time=expiry();
const result=await aws('cloudformation','create-change-set','--stack-name','ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity','--change-set-name','team-hub-kms-corrected-security-20261005','--change-set-type','CREATE','--template-body','file://'+pinned+'/first-create-security.template.json','--capabilities','CAPABILITY_NAMED_IAM','--tags','Key=Project,Value=ProjectRespawn','Key=Domain,Value=TeamHub','Key=Environment,Value=Ntgre','--description','Approved security revision 3e5a12edf9074bb8dc8d7bf0d83783b641aefc3973514e08aa4cc80f530050de; four security resources only');
save('security-prepared',{time,...result});console.log(JSON.stringify(result));
