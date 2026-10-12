import {read,save,E,B,L} from './common.mjs';
const inspection=read(B+'/inspection.json'), lifecycle=read(L+'/lifecycle-inspection.json');
const matrix=[];
for(const f of inspection.functions){
 for(const action of ['lambda:GetFunctionConfiguration','lambda:UpdateFunctionConfiguration'])matrix.push({principal:'temporary recovery role',action,resources:[f.actual.FunctionArn,...(action.endsWith('UpdateFunctionConfiguration')?[f.actual.FunctionArn+':$LATEST']:[])],conditions:'eu-north-1; approved <=900-second window',purpose:action.includes('Get')?'Fresh revision/code precheck and stabilization/readback':'Fixed complete environment update with pinned RevisionId',status:'REQUIRED',evidence:'Pinned workflow; qualified failure and historical direct successes'});
 for(const action of ['kms:Encrypt','kms:Decrypt'])matrix.push({principal:'temporary recovery role via Lambda',action,resources:[lifecycle.key],conditions:{ViaService:'lambda.eu-north-1.amazonaws.com',CallerAccount:'058264289478',FunctionArn:f.actual.FunctionArn,window:'<=900 seconds'},status:'REQUIRED',evidence:'direct-success-history.json; encryption-history.json; Encrypt failure'});
}
matrix.push(...[
 ['kms:DescribeKey','CloudFormation provider','Observed in CloudFormation update history, absent in inspected successful direct update window','NOT_GRANTED_TO_TEMPORARY_ROLE'],
 ['kms:CreateGrant','customer-managed-key configuration caller','Conditional for changing to a CMK; no KMSKeyArn change or matching Team Hub grant','NOT_REQUIRED_FOR_SELECTED_PATH'],
 ['kms:GenerateDataKey','lambda.amazonaws.com','AWS-managed key policy; historical DryRunOperationException is permission dry run, not completed key generation','SERVICE_OWNED_NOT_CALLER_GRANT'],
 ['kms:Decrypt','existing runtime roles via Lambda','Existing runtime and managed key policy; unchanged, live startup remains a gate','PRESERVED'],
 ['lambda:GetFunctionCodeSigningConfig / GetFunctionScalingConfig','CloudFormation provider','Not invoked by fixed direct recovery workflow','NOT_REQUIRED_FOR_SELECTED_PATH'],
 ['IAM role lifecycle / PassRole / Step Functions lifecycle / CloudFormation temporary stack lifecycle','RavenTest security operator','14 positive principal simulations; exact temporary role/machine/stack; fresh installed-role gate before start','CUSTODY_GATE'],
 ['logs/metrics reads; DynamoDB baseline reads; function drift detection; authenticated HTTP probes','verification operator / existing Ntgre identity','External acceptance only, no added temporary workflow permissions','LIVE_ACCEPTANCE_REQUIRED']
].map(([action,principal,evidence,status])=>({action,principal,evidence,status})));
save('permission-lifecycle-matrix',{at:new Date().toISOString(),matrix,scope:'Fixed direct configuration workflow, not arbitrary Lambda lifecycle',liveProof:false,awsWrites:0});
save('failure-matrix',{failures:[
 {stage:'Initial business deployment',date:'2026-10-08',result:'CFN complete, actual environments incomplete, authority 503',cause:'Observed execution-role Decrypt denies; provider-internal causality not fully observable',evidence:'../team-hub-config-repair-evidence-2026-10-09/provider-audit.json'},
 {stage:'Narrow configuration template repair',date:'2026-10-09',result:'Zero product changes; not executed',cause:'Desired CloudFormation template already contains complete maps',evidence:'../team-hub-config-deployment-evidence-2026-10-09/product-change-set.json'},
 {stage:'Drift-aware recovery',date:'2026-10-09',result:'Preparation blocked',cause:'Template binding and whole-stack provider discovery requirements; UNKNOWN logs not proven drift',evidence:'../team-hub-2b6-drift-recovery-permission-result.md'},
 {stage:'First fixed direct workflow',date:'2026-10-09',result:'Read denied; Command not attempted',cause:'Explicit NotResource denial excludes qualified $LATEST form',requestId:'b4cc1abf-61d4-4e15-908b-8794271d85d7',evidence:'../team-hub-recovery-execution-evidence-2026-10-09/workflow-history.json'},
 {stage:'Qualified ARN correction',date:'2026-10-09',result:'Prepared and separately authorized, not itself runtime acceptance',cause:'Qualified path corrected; KMS lifecycle incomplete',evidence:'../team-hub-qualified-recovery-evidence-2026-10-09/security-validation.json'},
 {stage:'Qualified recovery execution',date:'2026-10-10',result:'Read Encrypt denied; Command not attempted; executor removed',cause:'Inline policy Statement[2] NotAction explicit denial of kms:Encrypt; no boundary',requestId:'4dbe6fc5-8022-44c6-8fa1-08d6b1b9e973',kmsRequestId:'99600710-949a-4a11-9726-22ebd57a145c',evidence:'../team-hub-corrected-recovery-evidence-2026-10-10/execution-cloudtrail.json'}
],note:'Historical pointers retained; dates do not imply each stage executed AWS writes. Provider causality is bounded by available CloudTrail evidence.'});
save('offline-validation',{regressions:read(E+'/regressions.json'),integrityTests:{passed:29,failed:0,command:'node --test scripts/team-hub-recovery-complete/integrity.test.mjs'},build:{command:'npm.cmd run build',exit:0,warnings:['Existing /css/styles.css unresolved at build time','Main chunk exceeds 500 kB']},runtimeRebuilt:false,awsWrites:0});
