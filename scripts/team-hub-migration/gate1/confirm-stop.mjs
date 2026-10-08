import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {aws,read,save} from './read-only.mjs';
const exec=promisify(execFile),prep=read('docs/architecture/team-hub-2b3-gate1-evidence-2026-10-05/preparation.json');
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
const {stdout}=await exec('aws',['cloudformation','describe-change-set','--change-set-name',prep.changeSet.Id,'--profile','default','--region','eu-north-1','--output','json','--no-cli-pager'],{windowsHide:true,maxBuffer:20e6});const c=JSON.parse(stdout);assert.equal(c.Status,'CREATE_COMPLETE');assert.equal(c.ExecutionStatus,'AVAILABLE');
save('stop-confirmation',{at:new Date().toISOString(),identity,region:'eu-north-1',changeSet:{id:c.ChangeSetId,status:c.Status,executionStatus:c.ExecutionStatus,stack:c.StackId},executed:false,backupsCreated:0,awsPreparationCalls:7,templateObjectsUploaded:6,rootChangeSetsCreated:1,rollbackExecutionRequired:true,gate2Started:false,productionTouched:false});console.log(JSON.stringify({status:c.Status,executionStatus:c.ExecutionStatus,executed:false}));
