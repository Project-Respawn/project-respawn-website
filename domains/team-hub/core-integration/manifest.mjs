// Accepted owner manifest is bundled with the Team artifact; no endpoint overrides.
import manifest from '../../../config/domains/core/domain-endpoints.Ntgre.json' with {type:'json'};
export function validateCoreManifest(m=manifest){
 const reject=()=>{throw Error('CORE_MANIFEST_NOT_ACCEPTED');};
 const arn='arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts';
 if(m?.schemaVersion!=='core-endpoint.v1'||m.domain!=='Core'||m.status!=='ACCEPTED'||m.environment!=='Ntgre'||m.account!=='058264289478'||m.region!=='eu-north-1'||m.lambdaArn!==arn||m.endpoint!==arn||m.invocation!=='IAM'||m.authMode!=='AWS_IAM_AND_DELEGATED_COGNITO_ACCESS_JWT')reject();
 if(m.productRevision!=='4aad4b8df1b1272f12e93144b3a1e89a2addaab5e404950f924ff7d7b58b9e46'||m.deploymentRevision!==m.productRevision||m.runtimeSha256!=='4841f475dab09982d8ff5babc240c8a7d8809d05911de8e239ac9031e6fcefcf'||m.securityRevision!=='232c577cf84eb151dccaee88e702174a0225972fec87a3d432a2dc7f631acf79')reject();
 if(JSON.stringify(m.contractVersions)!==JSON.stringify(['environment.v1','authorization.decision.v1','directory.assignment.v1']))reject();
 const e=m.environmentContract;
 if(e?.contractVersion!=='environment.v1'||e.environment!==m.environment||e.account!==m.account||e.region!==m.region||e.poolId!=='eu-north-1_n24iLL7QE'||e.clientId!=='1iq7ovjaf7d16imdvbqgfgvf86'||e.issuer!==`https://cognito-idp.${e.region}.amazonaws.com/${e.poolId}`)reject();
 return Object.freeze({...m,environmentContract:Object.freeze({...e})});
}
export const acceptedCore=validateCoreManifest();
