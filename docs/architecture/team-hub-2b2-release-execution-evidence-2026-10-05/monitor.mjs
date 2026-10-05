import {aws,save} from './common.mjs';
const mode=process.argv[2];if(!['security','product'].includes(mode))throw Error('Invalid target');
const name='ProjectRespawn-TeamHub-Ntgre'+(mode==='security'?'-ReadProofSecurity':'');
const stack=(await aws('cloudformation','describe-stacks','--stack-name',name)).Stacks[0];const events=(await aws('cloudformation','describe-stack-events','--stack-name',name)).StackEvents;save(mode+'-stack',stack);save(mode+'-events',events);console.log(JSON.stringify({name,status:stack.StackStatus,disableRollback:stack.DisableRollback,recent:events.slice(0,6).map(e=>({id:e.LogicalResourceId,status:e.ResourceStatus,reason:e.ResourceStatusReason}))}));
