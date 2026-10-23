export const environment=Object.freeze({contractVersion:'environment.v1',environment:'Production',account:'058264289478',region:'eu-north-1',poolId:'eu-north-1_Uufjxul58',clientId:'2kc81ph5mgvo9eu2qjvmif5u8g',issuer:'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_Uufjxul58'});
export const root='amplify-d2cux232bpa951-master-branch-53ef67772a';
export const bucket='amplify-d2cux232bpa951-ma-projectrespawnstoragebuc-bw3gimudfvur';
export const models=['Team','TeamMembership','TeamRosterSlot','PlayerChampionPoolEntry'];
export const tables=models.map((model,i)=>({model,name:model+'-lte47f3mgbbvxehfgz476en3xy-NONE',arn:'arn:aws:dynamodb:eu-north-1:058264289478:table/'+model+'-lte47f3mgbbvxehfgz476en3xy-NONE',previousCount:[1,8,11,101][i],backupName:'ProjectRespawn-TeamHub-Production-'+model+'-Recovery-20261020',restoreName:'ProjectRespawn-TeamHub-Production-'+model+'-RecoveryProof-20261020'}));
export function requireProduction(e){if(JSON.stringify(e)!==JSON.stringify(environment))throw Error('WRONG_PRODUCTION_ENVIRONMENT');return e;}
