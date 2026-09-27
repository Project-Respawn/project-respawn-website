# Phase 1 Ntgre discrepancy matrix — individual resource evidence

Every record has exactly one classification. Full literal/intrinsic templates, AWS before/after values (including unknown/truncated values), physical IDs and recursively resolved dependency chains are preserved in [discrepancy-matrix.json](discrepancy-matrix.json). JSON null plus kind `absent` means the property is omitted, not an explicit null passed to AWS. Effective after-values are computed from pinned bindings and unchanged observed physical resources; they are not claimed to be AWS execution results. No change set was executed.

| Record | Logical ID | Type | AWS action / replacement | Classification |
| ---: | --- | --- | --- | --- |
| [1](#record-1) | apistack7B433BC7 | AWS::CloudFormation::Stack | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [2](#record-2) | function1351588B | AWS::CloudFormation::Stack | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [3](#record-3) | overlaysourcestackF7F134D8 | AWS::CloudFormation::Stack | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [4](#record-4) | twitchruntimelambdaE27C0484 | AWS::Lambda::Function | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [5](#record-5) | twitchruntimelambdaServiceRoleDefaultPolicy2D9A9F50 | AWS::IAM::Policy | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [6](#record-6) | OverlaySourceOverlaySourceFunctionC8484D26 | AWS::Lambda::Function | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [7](#record-7) | OverlaySourceOverlaySourceFunctionServiceRoleDefaultPolicyBE69E659 | AWS::IAM::Policy | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [8](#record-8) | OverlaySourceOverlaySourceHttpApiOverlayCreatorAuthorizer3B3A6DB8 | AWS::ApiGatewayV2::Authorizer | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [9](#record-9) | HttpApiDELETEtwitchcommandsmeMyFunctionIntegrationPermission988D4AF4 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [10](#record-10) | HttpApiGETprintfulordersproxyMyFunctionIntegrationPermission27B263F7 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [11](#record-11) | HttpApiGETprintfulproductsMyFunctionIntegration3EEB32F8 | AWS::ApiGatewayV2::Integration | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [12](#record-12) | HttpApiGETprintfulproductsMyFunctionIntegrationPermissionEEDCA91E | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [13](#record-13) | HttpApiGETprintfulproductsproxyMyFunctionIntegrationPermissionBBDC8EDC | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [14](#record-14) | HttpApiGETrevolutordersproxyMyFunctionIntegrationPermission59EAC615 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [15](#record-15) | HttpApiGETtwitchcommandsMyFunctionIntegrationPermissionB5137FD8 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [16](#record-16) | HttpApiGETtwitchcommandsmeMyFunctionIntegrationPermission65528725 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [17](#record-17) | HttpApiGETtwitchoauthcallbackMyFunctionIntegrationPermission6AC5B45C | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [18](#record-18) | HttpApiGETtwitchruntimeproxyMyFunctionIntegrationPermission2D5F0CC6 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [19](#record-19) | HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegration35B744C4 | AWS::ApiGatewayV2::Integration | Modify / False | EXPECTED_REFERENCE_PROPAGATION |
| [20](#record-20) | HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegrationPermissionB89EA49B | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [21](#record-21) | HttpApiGETtwitchstatusMyFunctionIntegrationPermissionAD0079D1 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [22](#record-22) | HttpApiPOSTintegrationsalpharewardeventsMyFunctionIntegrationPermission11B85ED7 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [23](#record-23) | HttpApiPOSTordersfulfillMyFunctionIntegrationPermission40CCD9E6 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [24](#record-24) | HttpApiPOSTordersimportexistingrevolutMyFunctionIntegrationPermissionFD0FFE2D | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [25](#record-25) | HttpApiPOSTordersrecoverfulfillmentMyFunctionIntegrationPermissionED664E9D | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [26](#record-26) | HttpApiPOSTprintfulordersMyFunctionIntegrationPermission1B479DCF | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [27](#record-27) | HttpApiPOSTrevolutcheckoutMyFunctionIntegrationPermissionD85394E5 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [28](#record-28) | HttpApiPOSTtwitchcommandsmeMyFunctionIntegrationPermissionD9749DA2 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [29](#record-29) | HttpApiPOSTtwitchconnectMyFunctionIntegrationPermissionA3D4DBC9 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [30](#record-30) | HttpApiPOSTtwitchruntimeproxyMyFunctionIntegrationPermission05736304 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [31](#record-31) | HttpApiPOSTtwitchruntimeproxyTwitchRuntimeIntegrationPermissionC9FB5F6E | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [32](#record-32) | HttpApiPOSTwebhooksrevolutMyFunctionIntegrationPermissionC877F07A | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [33](#record-33) | HttpApiPUTtwitchcommandsmeMyFunctionIntegrationPermission5A843795 | AWS::Lambda::Permission | Modify / True | SEMANTICALLY_EQUIVALENT_REPLACEMENT |
| [34](#record-34) | amplifyDataAmplifyCodegenAssetsAmplifyCodegenAssetsDeploymentCustomResource1536MiB21775929 | Custom::CDKBucketDeployment | Modify / Conditional | EXPECTED_PHASE1_CHANGE_NOT_PREVIOUSLY_ACCOUNTED |

<a id="record-1"></a>

## 1. apistack7B433BC7

- Physical ID: `arn:aws:cloudformation:eu-north-1:058264289478:stack/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-apistack7B433BC7-1E7HN2JNUSFNZ/c9a4a2e0-b5c9-11f1-bd1e-0a852f7715ef`
- Nested scope: `$root`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: stack/reference or provider evidence; see main report
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "RequiresRecreation": "Never"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "Automatic"
  }
]
```

Exact effective BEFORE:

```json
{
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA"
}
```

Exact effective AFTER:

```json
{
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA"
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/function1351588B",
    "id": "twitchruntimelambdaE27C0484",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "definitionUnchanged": true,
    "awsAction": "Modify",
    "awsReplacement": "False"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/function1351588B",
    "id": "function1351588B",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn",
    "expression": {
      "Fn::GetAtt": [
        "twitchruntimelambdaE27C0484",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA"
  }
]
```

<a id="record-2"></a>

## 2. function1351588B

- Physical ID: `arn:aws:cloudformation:eu-north-1:058264289478:stack/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-function1351588B-P11YAN395W7B/b4ec1220-b5c9-11f1-9e54-0effea944a5b`
- Nested scope: `$root`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: stack/reference or provider evidence; see main report
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "RequiresRecreation": "Never"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "Automatic"
  }
]
```

Exact effective BEFORE:

```json
{
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBApiId": "dxb2tdlulrch7hj2pts2mfijia",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Arn": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Arn": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConn258153F6": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDelive31C4BA1A": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebS468D0F74": "oc7oz18v8k",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBGraphQLUrl": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Ref": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Ref": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConn8E781C29": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDelive67B2727E": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01"
}
```

Exact effective AFTER:

```json
{
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBApiId": "dxb2tdlulrch7hj2pts2mfijia",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Arn": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Arn": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConn258153F6": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDelive31C4BA1A": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebS468D0F74": "oc7oz18v8k",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBGraphQLUrl": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Ref": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Ref": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConn8E781C29": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDelive67B2727E": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01"
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "TwitchTokenEncryptionKey6BAFD6FC",
    "type": "AWS::KMS::Key",
    "attribute": "Arn",
    "physicalId": "8656fcfe-9dfc-4cdf-b345-12665950f337",
    "value": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn",
    "expression": {
      "Fn::GetAtt": [
        "TwitchTokenEncryptionKey6BAFD6FC",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "resolved": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "amplifyDataGraphQLAPI42A6FA33",
    "type": "AWS::AppSync::GraphQLApi",
    "attribute": "ApiId",
    "physicalId": "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia",
    "value": "dxb2tdlulrch7hj2pts2mfijia",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBApiId",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataGraphQLAPI42A6FA33",
        "ApiId"
      ]
    },
    "expressionUnchanged": true,
    "observed": "dxb2tdlulrch7hj2pts2mfijia",
    "resolved": "dxb2tdlulrch7hj2pts2mfijia"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "modelIntrospectionSchemaBucketF566B665",
    "type": "AWS::S3::Bucket",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "value": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Arn",
    "expression": {
      "Fn::GetAtt": [
        "modelIntrospectionSchemaBucketF566B665",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "resolved": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlayPublicationB74679B6",
    "type": "AWS::DynamoDB::Table",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Arn",
    "expression": {
      "Fn::GetAtt": [
        "OverlaySourceOverlayPublicationB74679B6",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceConnectionBA1951A5",
    "type": "AWS::DynamoDB::Table",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConnectionA708AB60Arn",
    "expression": {
      "Fn::GetAtt": [
        "OverlaySourceOverlaySourceConnectionBA1951A5",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceTwitchEventDeliveryDedupe8C2A76A7",
    "type": "AWS::DynamoDB::Table",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDeliveryDedupeEAD426D5Arn",
    "expression": {
      "Fn::GetAtt": [
        "OverlaySourceTwitchEventDeliveryDedupe8C2A76A7",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceWebSocketApiDBBD0032",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "oc7oz18v8k",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebSocketApiA528A29FRef",
    "expression": {
      "Ref": "OverlaySourceOverlaySourceWebSocketApiDBBD0032"
    },
    "expressionUnchanged": true,
    "observed": "oc7oz18v8k",
    "resolved": "oc7oz18v8k"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "amplifyDataGraphQLAPI42A6FA33",
    "type": "AWS::AppSync::GraphQLApi",
    "attribute": "GraphQLUrl",
    "physicalId": "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia",
    "value": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBGraphQLUrl",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataGraphQLAPI42A6FA33",
        "GraphQLUrl"
      ]
    },
    "expressionUnchanged": true,
    "observed": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
    "resolved": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/data7552DF31",
    "id": "modelIntrospectionSchemaBucketF566B665",
    "type": "AWS::S3::Bucket",
    "physicalId": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Ref",
    "expression": {
      "Ref": "modelIntrospectionSchemaBucketF566B665"
    },
    "expressionUnchanged": true,
    "observed": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "resolved": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlayPublicationB74679B6",
    "type": "AWS::DynamoDB::Table",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Ref",
    "expression": {
      "Ref": "OverlaySourceOverlayPublicationB74679B6"
    },
    "expressionUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceConnectionBA1951A5",
    "type": "AWS::DynamoDB::Table",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConnectionA708AB60Ref",
    "expression": {
      "Ref": "OverlaySourceOverlaySourceConnectionBA1951A5"
    },
    "expressionUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceTwitchEventDeliveryDedupe8C2A76A7",
    "type": "AWS::DynamoDB::Table",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDeliveryDedupeEAD426D5Ref",
    "expression": {
      "Ref": "OverlaySourceTwitchEventDeliveryDedupe8C2A76A7"
    },
    "expressionUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01"
  }
]
```

<a id="record-3"></a>

## 3. overlaysourcestackF7F134D8

- Physical ID: `arn:aws:cloudformation:eu-north-1:058264289478:stack/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB/9010cc70-b5c9-11f1-aba2-0efff33f2321`
- Nested scope: `$root`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: stack/reference or provider evidence; see main report
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "RequiresRecreation": "Never"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "Automatic"
  }
]
```

Exact effective BEFORE:

```json
{
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNested8DEF4606": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70Outputsamplif12B19A64": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authNestedStackauthNestedStackResourceD8D2AADCOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAppClient1D794682Ref": "1iq7ovjaf7d16imdvbqgfgvf86",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authNestedStackauthNestedStackResourceD8D2AADCOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAFC7B76CRef": "eu-north-1_n24iLL7QE"
}
```

Exact effective AFTER:

```json
{
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNested8DEF4606": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70Outputsamplif12B19A64": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authNestedStackauthNestedStackResourceD8D2AADCOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAppClient1D794682Ref": "1iq7ovjaf7d16imdvbqgfgvf86",
  "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authNestedStackauthNestedStackResourceD8D2AADCOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAFC7B76CRef": "eu-north-1_n24iLL7QE"
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31/amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "id": "CreatorWorkspaceRecordTable",
    "type": "Custom::AmplifyDynamoDBTable",
    "attribute": "TableArn",
    "physicalId": "CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root/data7552DF31",
    "child": "$root/data7552DF31/amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "id": "amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordCreatorWorkspaceRecordTable07AC0D2ATableArn",
    "expression": {
      "Fn::GetAtt": [
        "CreatorWorkspaceRecordTable",
        "TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource73782A1EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecorBBD541B0",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordCreatorWorkspaceRecordTable07AC0D2ATableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31/amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "id": "BrandTable",
    "type": "Custom::AmplifyDynamoDBTable",
    "attribute": "TableArn",
    "physicalId": "Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root/data7552DF31",
    "child": "$root/data7552DF31/amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "id": "amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn",
    "expression": {
      "Fn::GetAtt": [
        "BrandTable",
        "TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70OutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/auth179371D7",
    "id": "amplifyAuthUserPoolAppClient2626C6F8",
    "type": "AWS::Cognito::UserPoolClient",
    "physicalId": "1iq7ovjaf7d16imdvbqgfgvf86",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/auth179371D7",
    "id": "auth179371D7",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAppClient1D794682Ref",
    "expression": {
      "Ref": "amplifyAuthUserPoolAppClient2626C6F8"
    },
    "expressionUnchanged": true,
    "observed": "1iq7ovjaf7d16imdvbqgfgvf86",
    "resolved": "1iq7ovjaf7d16imdvbqgfgvf86"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/auth179371D7",
    "id": "amplifyAuthUserPool4BA7F805",
    "type": "AWS::Cognito::UserPool",
    "physicalId": "eu-north-1_n24iLL7QE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/auth179371D7",
    "id": "auth179371D7",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAFC7B76CRef",
    "expression": {
      "Ref": "amplifyAuthUserPool4BA7F805"
    },
    "expressionUnchanged": true,
    "observed": "eu-north-1_n24iLL7QE",
    "resolved": "eu-north-1_n24iLL7QE"
  }
]
```

<a id="record-4"></a>

## 4. twitchruntimelambdaE27C0484

- Physical ID: `amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA`
- Nested scope: `$root/function1351588B`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/TWITCH_EVENT_DEDUPE_TABLE",
      "BeforeValue": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/TWITCH_EVENT_DEDUPE_TABLE",
      "BeforeValue": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDelive67B2727E"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_BUCKET_NAME",
      "BeforeValue": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Ref"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/OVERLAY_PUBLICATION_TABLE",
      "BeforeValue": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/TWITCH_TOKEN_KMS_KEY_ID",
      "BeforeValue": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/TWITCH_TOKEN_KMS_KEY_ID",
      "BeforeValue": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/OVERLAY_WEBSOCKET_MANAGEMENT_URL",
      "BeforeValue": "https://oc7oz18v8k.execute-api.eu-north-1.amazonaws.com/live",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebS468D0F74"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/OVERLAY_PUBLICATION_TABLE",
      "BeforeValue": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Ref"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/OVERLAY_CONNECTION_TABLE",
      "BeforeValue": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConn8E781C29"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/AMPLIFY_DATA_GRAPHQL_ENDPOINT",
      "BeforeValue": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/OVERLAY_WEBSOCKET_MANAGEMENT_URL",
      "BeforeValue": "https://oc7oz18v8k.execute-api.eu-north-1.amazonaws.com/live",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_BUCKET_NAME",
      "BeforeValue": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/OVERLAY_CONNECTION_TABLE",
      "BeforeValue": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/AMPLIFY_DATA_GRAPHQL_ENDPOINT",
      "BeforeValue": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBGraphQLUrl"
  }
]
```

Exact effective BEFORE:

```json
{
  "Architectures": [
    "x86_64"
  ],
  "Code": {
    "S3Bucket": "cdk-hnb659fds-assets-058264289478-eu-north-1",
    "S3Key": "f2406034524dd7f7b4132d8d8e8103e62a97240da5dc39554ec60083535b628b.zip"
  },
  "Environment": {
    "Variables": {
      "TWITCH_CLIENT_ID": "<value will be resolved during runtime>",
      "TWITCH_CLIENT_SECRET": "<value will be resolved during runtime>",
      "TWITCH_RUNTIME_AUTH_SECRET": "<value will be resolved during runtime>",
      "TWITCH_RUNTIME_CLIENT_ID": "respawn-twitch-bot",
      "TWITCH_TOKEN_KMS_KEY_ID": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
      "AMPLIFY_SSM_ENV_CONFIG": "{\"TWITCH_CLIENT_ID\":{\"path\":\"/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_ID\",\"sharedPath\":\"/amplify/shared/project-respawn-website/TWITCH_CLIENT_ID\"},\"TWITCH_CLIENT_SECRET\":{\"path\":\"/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_SECRET\",\"sharedPath\":\"/amplify/shared/project-respawn-website/TWITCH_CLIENT_SECRET\"},\"TWITCH_RUNTIME_AUTH_SECRET\":{\"path\":\"/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_RUNTIME_AUTH_SECRET\",\"sharedPath\":\"/amplify/shared/project-respawn-website/TWITCH_RUNTIME_AUTH_SECRET\"}}",
      "AMPLIFY_DATA_DEFAULT_NAME": "amplifyData",
      "AMPLIFY_DATA_GRAPHQL_ENDPOINT": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
      "AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_BUCKET_NAME": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
      "AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_KEY": "modelIntrospectionSchema.json",
      "OVERLAY_PUBLICATION_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
      "OVERLAY_CONNECTION_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
      "TWITCH_EVENT_DEDUPE_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
      "OVERLAY_WEBSOCKET_MANAGEMENT_URL": "https://oc7oz18v8k.execute-api.eu-north-1.amazonaws.com/live"
    }
  },
  "EphemeralStorage": {
    "Size": 512
  },
  "Handler": "index.handler",
  "MemorySize": 512,
  "Role": "arn:aws:iam::058264289478:role/amplify-projectrespawnweb-twitchruntimelambdaServic-uuqUw0mxD37F",
  "Runtime": "nodejs22.x",
  "Tags": [
    {
      "Key": "amplify:deployment-type",
      "Value": "sandbox"
    },
    {
      "Key": "amplify:friendly-name",
      "Value": "twitch-runtime"
    },
    {
      "Key": "created-by",
      "Value": "amplify"
    }
  ],
  "Timeout": 30
}
```

Exact effective AFTER:

```json
{
  "Architectures": [
    "x86_64"
  ],
  "Code": {
    "S3Bucket": "cdk-hnb659fds-assets-058264289478-eu-north-1",
    "S3Key": "f2406034524dd7f7b4132d8d8e8103e62a97240da5dc39554ec60083535b628b.zip"
  },
  "Environment": {
    "Variables": {
      "TWITCH_CLIENT_ID": "<value will be resolved during runtime>",
      "TWITCH_CLIENT_SECRET": "<value will be resolved during runtime>",
      "TWITCH_RUNTIME_AUTH_SECRET": "<value will be resolved during runtime>",
      "TWITCH_RUNTIME_CLIENT_ID": "respawn-twitch-bot",
      "TWITCH_TOKEN_KMS_KEY_ID": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
      "AMPLIFY_SSM_ENV_CONFIG": "{\"TWITCH_CLIENT_ID\":{\"path\":\"/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_ID\",\"sharedPath\":\"/amplify/shared/project-respawn-website/TWITCH_CLIENT_ID\"},\"TWITCH_CLIENT_SECRET\":{\"path\":\"/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_SECRET\",\"sharedPath\":\"/amplify/shared/project-respawn-website/TWITCH_CLIENT_SECRET\"},\"TWITCH_RUNTIME_AUTH_SECRET\":{\"path\":\"/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_RUNTIME_AUTH_SECRET\",\"sharedPath\":\"/amplify/shared/project-respawn-website/TWITCH_RUNTIME_AUTH_SECRET\"}}",
      "AMPLIFY_DATA_DEFAULT_NAME": "amplifyData",
      "AMPLIFY_DATA_GRAPHQL_ENDPOINT": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
      "AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_BUCKET_NAME": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
      "AMPLIFY_DATA_MODEL_INTROSPECTION_SCHEMA_KEY": "modelIntrospectionSchema.json",
      "OVERLAY_PUBLICATION_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
      "OVERLAY_CONNECTION_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
      "TWITCH_EVENT_DEDUPE_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
      "OVERLAY_WEBSOCKET_MANAGEMENT_URL": "https://oc7oz18v8k.execute-api.eu-north-1.amazonaws.com/live"
    }
  },
  "EphemeralStorage": {
    "Size": 512
  },
  "Handler": "index.handler",
  "MemorySize": 512,
  "Role": "arn:aws:iam::058264289478:role/amplify-projectrespawnweb-twitchruntimelambdaServic-uuqUw0mxD37F",
  "Runtime": "nodejs22.x",
  "Tags": [
    {
      "Key": "amplify:deployment-type",
      "Value": "sandbox"
    },
    {
      "Key": "amplify:friendly-name",
      "Value": "twitch-runtime"
    },
    {
      "Key": "created-by",
      "Value": "amplify"
    }
  ],
  "Timeout": 30
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "resolved": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBGraphQLUrl",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBGraphQLUrl"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
    "resolved": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Ref",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Ref"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "resolved": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Ref",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "overlaysourcestackF7F134D8",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Ref"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConn8E781C29",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "overlaysourcestackF7F134D8",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConnectionA708AB60Ref"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDelive67B2727E",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "overlaysourcestackF7F134D8",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDeliveryDedupeEAD426D5Ref"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebS468D0F74",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "overlaysourcestackF7F134D8",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebSocketApiA528A29FRef"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "oc7oz18v8k",
    "resolved": "oc7oz18v8k",
    "equalToLive": true
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/function1351588B",
    "id": "twitchruntimelambdaServiceRole1AA84597",
    "type": "AWS::IAM::Role",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-twitchruntimelambdaServic-uuqUw0mxD37F",
    "value": "arn:aws:iam::058264289478:role/amplify-projectrespawnweb-twitchruntimelambdaServic-uuqUw0mxD37F",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "TwitchTokenEncryptionKey6BAFD6FC",
    "type": "AWS::KMS::Key",
    "attribute": "Arn",
    "physicalId": "8656fcfe-9dfc-4cdf-b345-12665950f337",
    "value": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn",
    "expression": {
      "Fn::GetAtt": [
        "TwitchTokenEncryptionKey6BAFD6FC",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "resolved": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "amplifyDataGraphQLAPI42A6FA33",
    "type": "AWS::AppSync::GraphQLApi",
    "attribute": "GraphQLUrl",
    "physicalId": "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia",
    "value": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBGraphQLUrl",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataGraphQLAPI42A6FA33",
        "GraphQLUrl"
      ]
    },
    "expressionUnchanged": true,
    "observed": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql",
    "resolved": "https://ymoeacodczfipbtu67jpg73cp4.appsync-api.eu-north-1.amazonaws.com/graphql"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/data7552DF31",
    "id": "modelIntrospectionSchemaBucketF566B665",
    "type": "AWS::S3::Bucket",
    "physicalId": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Ref",
    "expression": {
      "Ref": "modelIntrospectionSchemaBucketF566B665"
    },
    "expressionUnchanged": true,
    "observed": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "resolved": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlayPublicationB74679B6",
    "type": "AWS::DynamoDB::Table",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Ref",
    "expression": {
      "Ref": "OverlaySourceOverlayPublicationB74679B6"
    },
    "expressionUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceConnectionBA1951A5",
    "type": "AWS::DynamoDB::Table",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConnectionA708AB60Ref",
    "expression": {
      "Ref": "OverlaySourceOverlaySourceConnectionBA1951A5"
    },
    "expressionUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceTwitchEventDeliveryDedupe8C2A76A7",
    "type": "AWS::DynamoDB::Table",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDeliveryDedupeEAD426D5Ref",
    "expression": {
      "Ref": "OverlaySourceTwitchEventDeliveryDedupe8C2A76A7"
    },
    "expressionUnchanged": true,
    "observed": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "resolved": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceWebSocketApiDBBD0032",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "oc7oz18v8k",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebSocketApiA528A29FRef",
    "expression": {
      "Ref": "OverlaySourceOverlaySourceWebSocketApiDBBD0032"
    },
    "expressionUnchanged": true,
    "observed": "oc7oz18v8k",
    "resolved": "oc7oz18v8k"
  }
]
```

<a id="record-5"></a>

## 5. twitchruntimelambdaServiceRoleDefaultPolicy2D9A9F50

- Physical ID: `ampli-twitc-0E5plflElg7n`
- Nested scope: `$root/function1351588B`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "PolicyDocument",
      "RequiresRecreation": "Never",
      "Path": "/Properties/PolicyDocument",
      "BeforeValue": "(Truncated-Signature):e49757d4d2f73acb00a66d77287b7f3aced876a0bc6ee457ccefdf128c209fad",
      "AfterValue": "{\"Version\":\"2012-10-17\"}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "PolicyDocument",
      "RequiresRecreation": "Never",
      "Path": "/Properties/PolicyDocument/Statement",
      "AfterValue": "[{\"Action\":\"kms:Decrypt\",\"Effect\":\"Allow\",\"Resource\":\"{{changeSet:KNOWN_AFTER_APPLY}}\"},{\"Action\":\"appsync:GraphQL\",\"Effect\":\"Allow\",\"Resource\":[\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\"]},{\"Action\":\"appsync:GraphQL\",\"Effect\":\"Allow\",\"Resource\":[\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\",\"{{changeSet:KNOWN_AFTER_APPLY}}\"]},{\"Action\":\"s3:GetObject\",\"Effect\":\"Allow\",\"Resource\":\"{{changeSet:KNOWN_AFTER_APPLY}}\"},{\"Action\":\"dynamodb:GetItem\",\"Effect\":\"Allow\",\"Resource\":\"{{changeSet:KNOWN_AFTER_APPLY}}\"},{\"Action\":\"dynamodb:Query\",\"Effect\":\"Allow\",\"Resource\":\"{{changeSet:KNOWN_AFTER_APPLY}}\"},{\"Action\":\"dynamodb:DeleteItem\",\"Effect\":\"Allow\",\"Resource\":\"{{changeSet:KNOWN_AFTER_APPLY}}\"},{\"Action\":[\"dynamodb:PutItem\",\"dynamodb:UpdateItem\"],\"Effect\":\"Allow\",\"Resource\":\"{{changeSet:KNOWN_AFTER_APPLY}}\"},{\"Action\":\"execute-api:ManageConnections\",\"Effect\":\"Allow\",\"Resource\":\"{{changeSet:KNOWN_AFTER_APPLY}}\"},{\"Action\":\"ssm:GetParameters\",\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_ID\",\"arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_CLIENT_ID\",\"arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_SECRET\",\"arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_CLIENT_SECRET\",\"arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_RUNTIME_AUTH_SECRET\",\"arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_RUNTIME_AUTH_SECRET\"]}]",
      "AttributeChangeType": "Add"
    },
    "Evaluation": "Static",
    "ChangeSource": "DirectModification"
  }
]
```

Exact effective BEFORE:

```json
{
  "PolicyDocument": {
    "Statement": [
      {
        "Action": "kms:Decrypt",
        "Effect": "Allow",
        "Resource": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337"
      },
      {
        "Action": "appsync:GraphQL",
        "Effect": "Allow",
        "Resource": [
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getTwitchIntegration",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/listTwitchCommands",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getTwitchTokenVault",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getTwitchRuntimeHealth",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getCreatorWorkspaceRecord",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getBrand",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/listRewardRedemptionEvents",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getRewardRedemptionEvent",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getRewardRedemptionEventClaim"
        ]
      },
      {
        "Action": "appsync:GraphQL",
        "Effect": "Allow",
        "Resource": [
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/updateTwitchIntegration",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/updateTwitchTokenVault",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/createTwitchTokenVault",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/updateTwitchRuntimeHealth",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/createTwitchRuntimeHealth",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/createRewardRedemptionEventClaim",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/updateRewardRedemptionEvent"
        ]
      },
      {
        "Action": "s3:GetObject",
        "Effect": "Allow",
        "Resource": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1/modelIntrospectionSchema.json"
      },
      {
        "Action": "dynamodb:GetItem",
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL"
      },
      {
        "Action": "dynamodb:Query",
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS/index/publicationId-index"
      },
      {
        "Action": "dynamodb:DeleteItem",
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS"
      },
      {
        "Action": [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01"
      },
      {
        "Action": "execute-api:ManageConnections",
        "Effect": "Allow",
        "Resource": "arn:aws:execute-api:eu-north-1:058264289478:oc7oz18v8k/live/POST/@connections/*"
      },
      {
        "Action": "ssm:GetParameters",
        "Effect": "Allow",
        "Resource": [
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_ID",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_CLIENT_ID",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_SECRET",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_CLIENT_SECRET",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_RUNTIME_AUTH_SECRET",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_RUNTIME_AUTH_SECRET"
        ]
      }
    ],
    "Version": "2012-10-17"
  },
  "PolicyName": "twitchruntimelambdaServiceRoleDefaultPolicy2D9A9F50",
  "Roles": [
    "amplify-projectrespawnweb-twitchruntimelambdaServic-uuqUw0mxD37F"
  ]
}
```

Exact effective AFTER:

```json
{
  "PolicyDocument": {
    "Statement": [
      {
        "Action": "kms:Decrypt",
        "Effect": "Allow",
        "Resource": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337"
      },
      {
        "Action": "appsync:GraphQL",
        "Effect": "Allow",
        "Resource": [
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getTwitchIntegration",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/listTwitchCommands",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getTwitchTokenVault",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getTwitchRuntimeHealth",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getCreatorWorkspaceRecord",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getBrand",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/listRewardRedemptionEvents",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getRewardRedemptionEvent",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Query/fields/getRewardRedemptionEventClaim"
        ]
      },
      {
        "Action": "appsync:GraphQL",
        "Effect": "Allow",
        "Resource": [
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/updateTwitchIntegration",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/updateTwitchTokenVault",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/createTwitchTokenVault",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/updateTwitchRuntimeHealth",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/createTwitchRuntimeHealth",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/createRewardRedemptionEventClaim",
          "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia/types/Mutation/fields/updateRewardRedemptionEvent"
        ]
      },
      {
        "Action": "s3:GetObject",
        "Effect": "Allow",
        "Resource": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1/modelIntrospectionSchema.json"
      },
      {
        "Action": "dynamodb:GetItem",
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL"
      },
      {
        "Action": "dynamodb:Query",
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS/index/publicationId-index"
      },
      {
        "Action": "dynamodb:DeleteItem",
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS"
      },
      {
        "Action": [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01"
      },
      {
        "Action": "execute-api:ManageConnections",
        "Effect": "Allow",
        "Resource": "arn:aws:execute-api:eu-north-1:058264289478:oc7oz18v8k/live/POST/@connections/*"
      },
      {
        "Action": "ssm:GetParameters",
        "Effect": "Allow",
        "Resource": [
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_ID",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_CLIENT_ID",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_CLIENT_SECRET",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_CLIENT_SECRET",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/projectrespawnwebsite/Ntgre-sandbox-8bd9d02332/TWITCH_RUNTIME_AUTH_SECRET",
          "arn:aws:ssm:eu-north-1:058264289478:parameter/amplify/shared/project-respawn-website/TWITCH_RUNTIME_AUTH_SECRET"
        ]
      }
    ],
    "Version": "2012-10-17"
  },
  "PolicyName": "twitchruntimelambdaServiceRoleDefaultPolicy2D9A9F50",
  "Roles": [
    "amplify-projectrespawnweb-twitchruntimelambdaServic-uuqUw0mxD37F"
  ]
}
```

Policy statement differences: **[]**. Every action, effect, resource, condition, role and policy name is unchanged; live GetRolePolicy exactly matches. No widening or narrowing.

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "resolved": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBApiId",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBApiId"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "dxb2tdlulrch7hj2pts2mfijia",
    "resolved": "dxb2tdlulrch7hj2pts2mfijia",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "resolved": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "overlaysourcestackF7F134D8",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConn258153F6",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "overlaysourcestackF7F134D8",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConnectionA708AB60Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDelive31C4BA1A",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "overlaysourcestackF7F134D8",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDeliveryDedupeEAD426D5Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/function1351588B",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackNestedStackoverlaysourcestackNestedStackResource1E39D21BOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebS468D0F74",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "overlaysourcestackF7F134D8",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebSocketApiA528A29FRef"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "oc7oz18v8k",
    "resolved": "oc7oz18v8k",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/function1351588B",
    "id": "twitchruntimelambdaServiceRole1AA84597",
    "type": "AWS::IAM::Role",
    "physicalId": "amplify-projectrespawnweb-twitchruntimelambdaServic-uuqUw0mxD37F",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "TwitchTokenEncryptionKey6BAFD6FC",
    "type": "AWS::KMS::Key",
    "attribute": "Arn",
    "physicalId": "8656fcfe-9dfc-4cdf-b345-12665950f337",
    "value": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataTwitchTokenEncryptionKeyBA57DA2EArn",
    "expression": {
      "Fn::GetAtt": [
        "TwitchTokenEncryptionKey6BAFD6FC",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337",
    "resolved": "arn:aws:kms:eu-north-1:058264289478:key/8656fcfe-9dfc-4cdf-b345-12665950f337"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "amplifyDataGraphQLAPI42A6FA33",
    "type": "AWS::AppSync::GraphQLApi",
    "attribute": "ApiId",
    "physicalId": "arn:aws:appsync:eu-north-1:058264289478:apis/dxb2tdlulrch7hj2pts2mfijia",
    "value": "dxb2tdlulrch7hj2pts2mfijia",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataGraphQLAPI0F1D14CBApiId",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataGraphQLAPI42A6FA33",
        "ApiId"
      ]
    },
    "expressionUnchanged": true,
    "observed": "dxb2tdlulrch7hj2pts2mfijia",
    "resolved": "dxb2tdlulrch7hj2pts2mfijia"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "modelIntrospectionSchemaBucketF566B665",
    "type": "AWS::S3::Bucket",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "value": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamodelIntrospectionSchemaBucket9A364824Arn",
    "expression": {
      "Fn::GetAtt": [
        "modelIntrospectionSchemaBucketF566B665",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1",
    "resolved": "arn:aws:s3:::amplify-projectrespawnweb-modelintrospectionschema-fqestze7l6h1"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlayPublicationB74679B6",
    "type": "AWS::DynamoDB::Table",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlayPublication40BBBBD1Arn",
    "expression": {
      "Fn::GetAtt": [
        "OverlaySourceOverlayPublicationB74679B6",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceConnectionBA1951A5",
    "type": "AWS::DynamoDB::Table",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceConnectionA708AB60Arn",
    "expression": {
      "Fn::GetAtt": [
        "OverlaySourceOverlaySourceConnectionBA1951A5",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceTwitchEventDeliveryDedupe8C2A76A7",
    "type": "AWS::DynamoDB::Table",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceTwitchEventDeliveryDedupeEAD426D5Arn",
    "expression": {
      "Fn::GetAtt": [
        "OverlaySourceTwitchEventDeliveryDedupe8C2A76A7",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceTwitchEventDeliveryDedupe8C2A76A7-19UQ4W2PLCO01"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceWebSocketApiDBBD0032",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "oc7oz18v8k",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/overlaysourcestackF7F134D8",
    "id": "overlaysourcestackF7F134D8",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332overlaysourcestackOverlaySourceOverlaySourceWebSocketApiA528A29FRef",
    "expression": {
      "Ref": "OverlaySourceOverlaySourceWebSocketApiDBBD0032"
    },
    "expressionUnchanged": true,
    "observed": "oc7oz18v8k",
    "resolved": "oc7oz18v8k"
  }
]
```

<a id="record-6"></a>

## 6. OverlaySourceOverlaySourceFunctionC8484D26

- Physical ID: `amplify-projectrespawnweb-OverlaySourceOverlaySour-2kKQMxNdJ0Qr`
- Nested scope: `$root/overlaysourcestackF7F134D8`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/WORKSPACE_TABLE",
      "BeforeValue": "CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/BRAND_TABLE",
      "BeforeValue": "Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/WORKSPACE_TABLE",
      "BeforeValue": "CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNested8DEF4606"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "Environment",
      "RequiresRecreation": "Never",
      "Path": "/Properties/Environment/Variables/BRAND_TABLE",
      "BeforeValue": "Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70Outputsamplif12B19A64"
  }
]
```

Exact effective BEFORE:

```json
{
  "Architectures": [
    "arm64"
  ],
  "Code": {
    "S3Bucket": "cdk-hnb659fds-assets-058264289478-eu-north-1",
    "S3Key": "923ca380819a43414dce4ecc968eaee7072e0bdefd14d4ad2516156e9eb19fb9.zip"
  },
  "Environment": {
    "Variables": {
      "PUBLICATION_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
      "CONNECTION_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
      "WORKSPACE_TABLE": "CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
      "BRAND_TABLE": "Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
      "FRONTEND_ORIGIN": "http://localhost:5174",
      "OVERLAY_CREDENTIAL_KEY_ID": "arn:aws:kms:eu-north-1:058264289478:key/76bd4f9a-72aa-4bb4-82b3-05a4fbc16673",
      "WEBSOCKET_URL": "wss://oc7oz18v8k.execute-api.eu-north-1.amazonaws.com/live",
      "WEBSOCKET_MANAGEMENT_URL": "https://oc7oz18v8k.execute-api.eu-north-1.amazonaws.com/live"
    }
  },
  "Handler": "index.handler",
  "MemorySize": 512,
  "Role": "arn:aws:iam::058264289478:role/amplify-projectrespawnweb-OverlaySourceOverlaySourc-P0O3odUcf6sI",
  "Runtime": "nodejs22.x",
  "Tags": [
    {
      "Key": "amplify:deployment-type",
      "Value": "sandbox"
    },
    {
      "Key": "created-by",
      "Value": "amplify"
    }
  ],
  "Timeout": 15
}
```

Exact effective AFTER:

```json
{
  "Architectures": [
    "arm64"
  ],
  "Code": {
    "S3Bucket": "cdk-hnb659fds-assets-058264289478-eu-north-1",
    "S3Key": "923ca380819a43414dce4ecc968eaee7072e0bdefd14d4ad2516156e9eb19fb9.zip"
  },
  "Environment": {
    "Variables": {
      "PUBLICATION_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
      "CONNECTION_TABLE": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
      "WORKSPACE_TABLE": "CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
      "BRAND_TABLE": "Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
      "FRONTEND_ORIGIN": "http://localhost:5174",
      "OVERLAY_CREDENTIAL_KEY_ID": "arn:aws:kms:eu-north-1:058264289478:key/76bd4f9a-72aa-4bb4-82b3-05a4fbc16673",
      "WEBSOCKET_URL": "wss://oc7oz18v8k.execute-api.eu-north-1.amazonaws.com/live",
      "WEBSOCKET_MANAGEMENT_URL": "https://oc7oz18v8k.execute-api.eu-north-1.amazonaws.com/live"
    }
  },
  "Handler": "index.handler",
  "MemorySize": 512,
  "Role": "arn:aws:iam::058264289478:role/amplify-projectrespawnweb-OverlaySourceOverlaySourc-P0O3odUcf6sI",
  "Runtime": "nodejs22.x",
  "Tags": [
    {
      "Key": "amplify:deployment-type",
      "Value": "sandbox"
    },
    {
      "Key": "created-by",
      "Value": "amplify"
    }
  ],
  "Timeout": 15
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlayPublicationB74679B6",
    "type": "AWS::DynamoDB::Table",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceConnectionBA1951A5",
    "type": "AWS::DynamoDB::Table",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "parameter",
    "stack": "$root/overlaysourcestackF7F134D8",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNested8DEF4606",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource73782A1EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecorBBD541B0"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/overlaysourcestackF7F134D8",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70Outputsamplif12B19A64",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70OutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "equalToLive": true
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlayCredentialKey67E3466D",
    "type": "AWS::KMS::Key",
    "attribute": "Arn",
    "physicalId": "76bd4f9a-72aa-4bb4-82b3-05a4fbc16673",
    "value": "arn:aws:kms:eu-north-1:058264289478:key/76bd4f9a-72aa-4bb4-82b3-05a4fbc16673",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceWebSocketApiDBBD0032",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "oc7oz18v8k",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceFunctionServiceRoleC4FF275B",
    "type": "AWS::IAM::Role",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-OverlaySourceOverlaySourc-P0O3odUcf6sI",
    "value": "arn:aws:iam::058264289478:role/amplify-projectrespawnweb-OverlaySourceOverlaySourc-P0O3odUcf6sI",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31/amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "id": "CreatorWorkspaceRecordTable",
    "type": "Custom::AmplifyDynamoDBTable",
    "attribute": "TableArn",
    "physicalId": "CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root/data7552DF31",
    "child": "$root/data7552DF31/amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "id": "amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordCreatorWorkspaceRecordTable07AC0D2ATableArn",
    "expression": {
      "Fn::GetAtt": [
        "CreatorWorkspaceRecordTable",
        "TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource73782A1EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecorBBD541B0",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordCreatorWorkspaceRecordTable07AC0D2ATableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31/amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "id": "BrandTable",
    "type": "Custom::AmplifyDynamoDBTable",
    "attribute": "TableArn",
    "physicalId": "Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root/data7552DF31",
    "child": "$root/data7552DF31/amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "id": "amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn",
    "expression": {
      "Fn::GetAtt": [
        "BrandTable",
        "TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70OutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
  }
]
```

<a id="record-7"></a>

## 7. OverlaySourceOverlaySourceFunctionServiceRoleDefaultPolicyBE69E659

- Physical ID: `ampli-Overl-DqiOKui7a5FF`
- Nested scope: `$root/overlaysourcestackF7F134D8`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "PolicyDocument",
      "RequiresRecreation": "Never",
      "Path": "/Properties/PolicyDocument",
      "BeforeValue": "{\"Statement\":[{\"Action\":[\"dynamodb:BatchGetItem\",\"dynamodb:Query\",\"dynamodb:GetItem\",\"dynamodb:Scan\",\"dynamodb:ConditionCheckItem\",\"dynamodb:BatchWriteItem\",\"dynamodb:PutItem\",\"dynamodb:UpdateItem\",\"dynamodb:DeleteItem\",\"dynamodb:DescribeTable\"],\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL\",\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL/index/*\"]},{\"Action\":[\"dynamodb:GetRecords\",\"dynamodb:GetShardIterator\"],\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL\",\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL/index/*\"]},{\"Action\":[\"dynamodb:BatchGetItem\",\"dynamodb:Query\",\"dynamodb:GetItem\",\"dynamodb:Scan\",\"dynamodb:ConditionCheckItem\",\"dynamodb:BatchWriteItem\",\"dynamodb:PutItem\",\"dynamodb:UpdateItem\",\"dynamodb:DeleteItem\",\"dynamodb:DescribeTable\"],\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS\",\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS/index/*\"]},{\"Action\":[\"dynamodb:GetRecords\",\"dynamodb:GetShardIterator\"],\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS\",\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS/index/*\"]},{\"Action\":[\"dynamodb:BatchGetItem\",\"dynamodb:Query\",\"dynamodb:GetItem\",\"dynamodb:Scan\",\"dynamodb:ConditionCheckItem\",\"dynamodb:DescribeTable\"],\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE\"]},{\"Action\":[\"dynamodb:GetRecords\",\"dynamodb:GetShardIterator\"],\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE\"]},{\"Action\":[\"dynamodb:BatchGetItem\",\"dynamodb:Query\",\"dynamodb:GetItem\",\"dynamodb:Scan\",\"dynamodb:ConditionCheckItem\",\"dynamodb:DescribeTable\"],\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE\"]},{\"Action\":[\"dynamodb:GetRecords\",\"dynamodb:GetShardIterator\"],\"Effect\":\"Allow\",\"Resource\":[\"arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE\"]},{\"Action\":\"dynamodb:TransactWriteItems\",\"Effect\":\"Allow\",\"Resource\":\"arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL\"},{\"Action\":[\"kms:Decrypt\",\"kms:Encrypt\",\"kms:ReEncrypt*\",\"kms:GenerateDataKey*\"],\"Effect\":\"Allow\",\"Resource\":\"arn:aws:kms:eu-north-1:058264289478:key/76bd4f9a-72aa-4bb4-82b3-05a4fbc16673\"},{\"Action\":\"execute-api:ManageConnections\",\"Effect\":\"Allow\",\"Resource\":\"arn:aws:execute-api:eu-north-1:058264289478:oc7oz18v8k/live/POST/@connections/*\"}],\"Version\":\"2012-10-17\"}",
      "AfterValue": "(Truncated-Signature):2a5cedb1b11d3047c80aeb044062cd27784e8500bd2b2e73731b927de50867c8",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "DirectModification"
  }
]
```

Exact effective BEFORE:

```json
{
  "PolicyDocument": {
    "Statement": [
      {
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL/index/*"
        ]
      },
      {
        "Action": [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL/index/*"
        ]
      },
      {
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS/index/*"
        ]
      },
      {
        "Action": [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS/index/*"
        ]
      },
      {
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:DescribeTable"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
        ]
      },
      {
        "Action": [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
        ]
      },
      {
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:DescribeTable"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
        ]
      },
      {
        "Action": [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
        ]
      },
      {
        "Action": "dynamodb:TransactWriteItems",
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL"
      },
      {
        "Action": [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:kms:eu-north-1:058264289478:key/76bd4f9a-72aa-4bb4-82b3-05a4fbc16673"
      },
      {
        "Action": "execute-api:ManageConnections",
        "Effect": "Allow",
        "Resource": "arn:aws:execute-api:eu-north-1:058264289478:oc7oz18v8k/live/POST/@connections/*"
      }
    ],
    "Version": "2012-10-17"
  },
  "PolicyName": "OverlaySourceOverlaySourceFunctionServiceRoleDefaultPolicyBE69E659",
  "Roles": [
    "amplify-projectrespawnweb-OverlaySourceOverlaySourc-P0O3odUcf6sI"
  ]
}
```

Exact effective AFTER:

```json
{
  "PolicyDocument": {
    "Statement": [
      {
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL/index/*"
        ]
      },
      {
        "Action": [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL/index/*"
        ]
      },
      {
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS/index/*"
        ]
      },
      {
        "Action": [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
          "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS/index/*"
        ]
      },
      {
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:DescribeTable"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
        ]
      },
      {
        "Action": [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
        ]
      },
      {
        "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:ConditionCheckItem",
          "dynamodb:DescribeTable"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
        ]
      },
      {
        "Action": [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator"
        ],
        "Effect": "Allow",
        "Resource": [
          "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
        ]
      },
      {
        "Action": "dynamodb:TransactWriteItems",
        "Effect": "Allow",
        "Resource": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL"
      },
      {
        "Action": [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:kms:eu-north-1:058264289478:key/76bd4f9a-72aa-4bb4-82b3-05a4fbc16673"
      },
      {
        "Action": "execute-api:ManageConnections",
        "Effect": "Allow",
        "Resource": "arn:aws:execute-api:eu-north-1:058264289478:oc7oz18v8k/live/POST/@connections/*"
      }
    ],
    "Version": "2012-10-17"
  },
  "PolicyName": "OverlaySourceOverlaySourceFunctionServiceRoleDefaultPolicyBE69E659",
  "Roles": [
    "amplify-projectrespawnweb-OverlaySourceOverlaySourc-P0O3odUcf6sI"
  ]
}
```

Policy statement differences: **[]**. Every action, effect, resource, condition, role and policy name is unchanged; live GetRolePolicy exactly matches. No widening or narrowing.

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlayPublicationB74679B6",
    "type": "AWS::DynamoDB::Table",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlayPublicationB74679B6-1FYTNX9CQ23ZL",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceConnectionBA1951A5",
    "type": "AWS::DynamoDB::Table",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-overlaysourcestackF7F134D8-11RZN039WXJHB-OverlaySourceOverlaySourceConnectionBA1951A5-1LT60K10YBQCS",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "parameter",
    "stack": "$root/overlaysourcestackF7F134D8",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNested8DEF4606",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource73782A1EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecorBBD541B0"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/overlaysourcestackF7F134D8",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70Outputsamplif12B19A64",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70OutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "equalToLive": true
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlayCredentialKey67E3466D",
    "type": "AWS::KMS::Key",
    "attribute": "Arn",
    "physicalId": "76bd4f9a-72aa-4bb4-82b3-05a4fbc16673",
    "value": "arn:aws:kms:eu-north-1:058264289478:key/76bd4f9a-72aa-4bb4-82b3-05a4fbc16673",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceWebSocketApiDBBD0032",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "oc7oz18v8k",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceFunctionServiceRoleC4FF275B",
    "type": "AWS::IAM::Role",
    "physicalId": "amplify-projectrespawnweb-OverlaySourceOverlaySourc-P0O3odUcf6sI",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31/amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "id": "CreatorWorkspaceRecordTable",
    "type": "Custom::AmplifyDynamoDBTable",
    "attribute": "TableArn",
    "physicalId": "CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root/data7552DF31",
    "child": "$root/data7552DF31/amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "id": "amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordCreatorWorkspaceRecordTable07AC0D2ATableArn",
    "expression": {
      "Fn::GetAtt": [
        "CreatorWorkspaceRecordTable",
        "TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource73782A1EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecorBBD541B0",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataCreatorWorkspaceRecordNestedStackCreatorWorkspaceRecordNestedStackResource32B99DC0",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataCreatorWorkspaceRecordCreatorWorkspaceRecordTable07AC0D2ATableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/CreatorWorkspaceRecord-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31/amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "id": "BrandTable",
    "type": "Custom::AmplifyDynamoDBTable",
    "attribute": "TableArn",
    "physicalId": "Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "value": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root/data7552DF31",
    "child": "$root/data7552DF31/amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "id": "amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn",
    "expression": {
      "Fn::GetAtt": [
        "BrandTable",
        "TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandNestedStackBrandNestedStackResource4F84BF70OutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn",
    "expression": {
      "Fn::GetAtt": [
        "amplifyDataBrandNestedStackBrandNestedStackResource8795145F",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataamplifyDataBrandBrandTable19E945F6TableArn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE",
    "resolved": "arn:aws:dynamodb:eu-north-1:058264289478:table/Brand-dxb2tdlulrch7hj2pts2mfijia-NONE"
  }
]
```

<a id="record-8"></a>

## 8. OverlaySourceOverlaySourceHttpApiOverlayCreatorAuthorizer3B3A6DB8

- Physical ID: `u5wezi`
- Nested scope: `$root/overlaysourcestackF7F134D8`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "JwtConfiguration",
      "RequiresRecreation": "Never",
      "Path": "/Properties/JwtConfiguration/Audience/0",
      "BeforeValue": "1iq7ovjaf7d16imdvbqgfgvf86",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authNestedStackauthNestedStackResourceD8D2AADCOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAppClient1D794682Ref"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "JwtConfiguration",
      "RequiresRecreation": "Never",
      "Path": "/Properties/JwtConfiguration/Issuer",
      "BeforeValue": "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authNestedStackauthNestedStackResourceD8D2AADCOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAFC7B76CRef"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "JwtConfiguration",
      "RequiresRecreation": "Never",
      "Path": "/Properties/JwtConfiguration/Audience/0",
      "BeforeValue": "1iq7ovjaf7d16imdvbqgfgvf86",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "JwtConfiguration",
      "RequiresRecreation": "Never",
      "Path": "/Properties/JwtConfiguration/Issuer",
      "BeforeValue": "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Exact effective BEFORE:

```json
{
  "ApiId": "f7oxg5hy72",
  "AuthorizerType": "JWT",
  "IdentitySource": [
    "$request.header.Authorization"
  ],
  "JwtConfiguration": {
    "Audience": [
      "1iq7ovjaf7d16imdvbqgfgvf86"
    ],
    "Issuer": "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE"
  },
  "Name": "OverlayCreatorAuthorizer"
}
```

Exact effective AFTER:

```json
{
  "ApiId": "f7oxg5hy72",
  "AuthorizerType": "JWT",
  "IdentitySource": [
    "$request.header.Authorization"
  ],
  "JwtConfiguration": {
    "Audience": [
      "1iq7ovjaf7d16imdvbqgfgvf86"
    ],
    "Issuer": "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_n24iLL7QE"
  },
  "Name": "OverlayCreatorAuthorizer"
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-ref",
    "stack": "$root/overlaysourcestackF7F134D8",
    "id": "OverlaySourceOverlaySourceHttpApi0B933781",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "f7oxg5hy72",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "parameter",
    "stack": "$root/overlaysourcestackF7F134D8",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authNestedStackauthNestedStackResourceD8D2AADCOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAppClient1D794682Ref",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "auth179371D7",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAppClient1D794682Ref"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "1iq7ovjaf7d16imdvbqgfgvf86",
    "resolved": "1iq7ovjaf7d16imdvbqgfgvf86",
    "equalToLive": true
  },
  {
    "kind": "parameter",
    "stack": "$root/overlaysourcestackF7F134D8",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authNestedStackauthNestedStackResourceD8D2AADCOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAFC7B76CRef",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "auth179371D7",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAFC7B76CRef"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "eu-north-1_n24iLL7QE",
    "resolved": "eu-north-1_n24iLL7QE",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/auth179371D7",
    "id": "amplifyAuthUserPoolAppClient2626C6F8",
    "type": "AWS::Cognito::UserPoolClient",
    "physicalId": "1iq7ovjaf7d16imdvbqgfgvf86",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/auth179371D7",
    "id": "auth179371D7",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAppClient1D794682Ref",
    "expression": {
      "Ref": "amplifyAuthUserPoolAppClient2626C6F8"
    },
    "expressionUnchanged": true,
    "observed": "1iq7ovjaf7d16imdvbqgfgvf86",
    "resolved": "1iq7ovjaf7d16imdvbqgfgvf86"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/auth179371D7",
    "id": "amplifyAuthUserPool4BA7F805",
    "type": "AWS::Cognito::UserPool",
    "physicalId": "eu-north-1_n24iLL7QE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/auth179371D7",
    "id": "auth179371D7",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332authamplifyAuthUserPoolAFC7B76CRef",
    "expression": {
      "Ref": "amplifyAuthUserPool4BA7F805"
    },
    "expressionUnchanged": true,
    "observed": "eu-north-1_n24iLL7QE",
    "resolved": "eu-north-1_n24iLL7QE"
  }
]
```

<a id="record-9"></a>

## 9. HttpApiDELETEtwitchcommandsmeMyFunctionIntegrationPermission988D4AF4

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiDELETEtwitchcommandsmeMyFunctionInte-f0kff07XeWtq`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands/me"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands/me"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands/me",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands/me",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/commands/me",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-10"></a>

## 10. HttpApiGETprintfulordersproxyMyFunctionIntegrationPermission27B263F7

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETprintfulordersproxyMyFunctionInte-aFaZ6FhAoMFg`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/printful/orders/{proxy+}"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/printful/orders/{proxy+}"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/printful/orders/{proxy+}",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/printful/orders/{proxy+}",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "printful/orders/{proxy+}",
  "paymentOrFulfillment": true,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-11"></a>

## 11. HttpApiGETprintfulproductsMyFunctionIntegration3EEB32F8

- Physical ID: `eelaubc`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "IntegrationUri",
      "RequiresRecreation": "Never",
      "Path": "/Properties/IntegrationUri",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "IntegrationUri",
      "RequiresRecreation": "Never",
      "Path": "/Properties/IntegrationUri",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Exact effective BEFORE:

```json
{
  "ApiId": "jm15a0rmi0",
  "IntegrationType": "AWS_PROXY",
  "IntegrationUri": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
  "PayloadFormatVersion": "2.0"
}
```

Exact effective AFTER:

```json
{
  "ApiId": "jm15a0rmi0",
  "IntegrationType": "AWS_PROXY",
  "IntegrationUri": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
  "PayloadFormatVersion": "2.0"
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-12"></a>

## 12. HttpApiGETprintfulproductsMyFunctionIntegrationPermissionEEDCA91E

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETprintfulproductsMyFunctionIntegra-HEgXhssYEiNH`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/printful/products"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/printful/products"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/printful/products",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/printful/products",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "printful/products",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-13"></a>

## 13. HttpApiGETprintfulproductsproxyMyFunctionIntegrationPermissionBBDC8EDC

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETprintfulproductsproxyMyFunctionIn-cOLVgu4dq84P`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/printful/products/{proxy+}"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/printful/products/{proxy+}"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/printful/products/{proxy+}",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/printful/products/{proxy+}",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "printful/products/{proxy+}",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-14"></a>

## 14. HttpApiGETrevolutordersproxyMyFunctionIntegrationPermission59EAC615

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETrevolutordersproxyMyFunctionInteg-hWWsuwAU9Cu4`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/revolut/orders/{proxy+}"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/revolut/orders/{proxy+}"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/revolut/orders/{proxy+}",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/revolut/orders/{proxy+}",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "revolut/orders/{proxy+}",
  "paymentOrFulfillment": true,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-15"></a>

## 15. HttpApiGETtwitchcommandsMyFunctionIntegrationPermissionB5137FD8

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETtwitchcommandsMyFunctionIntegrati-Gw3AiqZMbHT0`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/commands",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-16"></a>

## 16. HttpApiGETtwitchcommandsmeMyFunctionIntegrationPermission65528725

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETtwitchcommandsmeMyFunctionIntegra-k2e2t0IZNXPr`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands/me"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands/me"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands/me",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands/me",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/commands/me",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-17"></a>

## 17. HttpApiGETtwitchoauthcallbackMyFunctionIntegrationPermission6AC5B45C

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETtwitchoauthcallbackMyFunctionInte-NzwQkbdLWBiI`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/oauth/callback"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/oauth/callback"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/oauth/callback",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/oauth/callback",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/oauth/callback",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-18"></a>

## 18. HttpApiGETtwitchruntimeproxyMyFunctionIntegrationPermission2D5F0CC6

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETtwitchruntimeproxyMyFunctionInteg-fQys690Sp2tE`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/runtime/{proxy+}"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/runtime/{proxy+}"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/runtime/{proxy+}",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/runtime/{proxy+}",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/runtime/{proxy+}",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-19"></a>

## 19. HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegration35B744C4

- Physical ID: `x291v8i`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / False
- Classification: **EXPECTED_REFERENCE_PROPAGATION**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: No effective desired configuration change; AWS may reapply identical resolved values.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "IntegrationUri",
      "RequiresRecreation": "Never",
      "Path": "/Properties/IntegrationUri",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "IntegrationUri",
      "RequiresRecreation": "Never",
      "Path": "/Properties/IntegrationUri",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Exact effective BEFORE:

```json
{
  "ApiId": "jm15a0rmi0",
  "IntegrationType": "AWS_PROXY",
  "IntegrationUri": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
  "PayloadFormatVersion": "2.0"
}
```

Exact effective AFTER:

```json
{
  "ApiId": "jm15a0rmi0",
  "IntegrationType": "AWS_PROXY",
  "IntegrationUri": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
  "PayloadFormatVersion": "2.0"
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "function1351588B",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "equalToLive": true
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/function1351588B",
    "id": "twitchruntimelambdaE27C0484",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "definitionUnchanged": true,
    "awsAction": "Modify",
    "awsReplacement": "False"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/function1351588B",
    "id": "function1351588B",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn",
    "expression": {
      "Fn::GetAtt": [
        "twitchruntimelambdaE27C0484",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA"
  }
]
```

<a id="record-20"></a>

## 20. HttpApiGETtwitchruntimeproxyTwitchRuntimeIntegrationPermissionB89EA49B

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETtwitchruntimeproxyTwitchRuntimeIn-aIPK233JWkoQ`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/runtime/{proxy+}"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/runtime/{proxy+}"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/runtime/{proxy+}",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/runtime/{proxy+}",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/runtime/{proxy+}",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 981,
    "fullOverlapBytes": 1909,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "function1351588B",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/function1351588B",
    "id": "twitchruntimelambdaE27C0484",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "definitionUnchanged": true,
    "awsAction": "Modify",
    "awsReplacement": "False"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/function1351588B",
    "id": "function1351588B",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn",
    "expression": {
      "Fn::GetAtt": [
        "twitchruntimelambdaE27C0484",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA"
  }
]
```

<a id="record-21"></a>

## 21. HttpApiGETtwitchstatusMyFunctionIntegrationPermissionAD0079D1

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiGETtwitchstatusMyFunctionIntegration-faPdrmOa7I7y`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/status"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/status"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/status",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/status",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/status",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-22"></a>

## 22. HttpApiPOSTintegrationsalpharewardeventsMyFunctionIntegrationPermission11B85ED7

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTintegrationsalpharewardeventsMyF-LDWrlX0Hfkzt`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/integrations/alpha/reward-events"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/integrations/alpha/reward-events"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/integrations/alpha/reward-events",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/integrations/alpha/reward-events",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "integrations/alpha/reward-events",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-23"></a>

## 23. HttpApiPOSTordersfulfillMyFunctionIntegrationPermission40CCD9E6

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTordersfulfillMyFunctionIntegrati-mD93LGRlNYHm`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/orders/fulfill"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/orders/fulfill"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/orders/fulfill",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/orders/fulfill",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "orders/fulfill",
  "paymentOrFulfillment": true,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-24"></a>

## 24. HttpApiPOSTordersimportexistingrevolutMyFunctionIntegrationPermissionFD0FFE2D

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTordersimportexistingrevolutMyFun-rfP58hkr3wJG`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/orders/import-existing-revolut"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/orders/import-existing-revolut"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/orders/import-existing-revolut",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/orders/import-existing-revolut",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "orders/import-existing-revolut",
  "paymentOrFulfillment": true,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-25"></a>

## 25. HttpApiPOSTordersrecoverfulfillmentMyFunctionIntegrationPermissionED664E9D

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTordersrecoverfulfillmentMyFuncti-vWElWQ7K0Vnr`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/orders/recover-fulfillment"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/orders/recover-fulfillment"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/orders/recover-fulfillment",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/orders/recover-fulfillment",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "orders/recover-fulfillment",
  "paymentOrFulfillment": true,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-26"></a>

## 26. HttpApiPOSTprintfulordersMyFunctionIntegrationPermission1B479DCF

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTprintfulordersMyFunctionIntegrat-40oIhjyBALId`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/printful/orders"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/printful/orders"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/printful/orders",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/printful/orders",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "printful/orders",
  "paymentOrFulfillment": true,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-27"></a>

## 27. HttpApiPOSTrevolutcheckoutMyFunctionIntegrationPermissionD85394E5

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTrevolutcheckoutMyFunctionIntegra-NxZ9oVyUUpfS`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/revolut/checkout"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/revolut/checkout"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/revolut/checkout",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/revolut/checkout",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "revolut/checkout",
  "paymentOrFulfillment": true,
  "webhook": false,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-28"></a>

## 28. HttpApiPOSTtwitchcommandsmeMyFunctionIntegrationPermissionD9749DA2

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTtwitchcommandsmeMyFunctionIntegr-35F8lmc5fXbg`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands/me"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands/me"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands/me",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands/me",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/commands/me",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-29"></a>

## 29. HttpApiPOSTtwitchconnectMyFunctionIntegrationPermissionA3D4DBC9

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTtwitchconnectMyFunctionIntegrati-4pJFxWmDFquK`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/connect"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/connect"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/connect",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/connect",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/connect",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-30"></a>

## 30. HttpApiPOSTtwitchruntimeproxyMyFunctionIntegrationPermission05736304

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTtwitchruntimeproxyMyFunctionInte-6fEacfdoo9pt`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/runtime/{proxy+}"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/runtime/{proxy+}"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/runtime/{proxy+}",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/runtime/{proxy+}",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/runtime/{proxy+}",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-31"></a>

## 31. HttpApiPOSTtwitchruntimeproxyTwitchRuntimeIntegrationPermissionC9FB5F6E

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTtwitchruntimeproxyTwitchRuntimeI-tQPTXwqLZKdD`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/runtime/{proxy+}"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/runtime/{proxy+}"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/runtime/{proxy+}",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/runtime/{proxy+}",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/runtime/{proxy+}",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 981,
    "fullOverlapBytes": 1909,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functionNestedStackfunctionNestedStackResource9695F02FOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "function1351588B",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/function1351588B",
    "id": "twitchruntimelambdaE27C0484",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "definitionUnchanged": true,
    "awsAction": "Modify",
    "awsReplacement": "False"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/function1351588B",
    "id": "function1351588B",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332functiontwitchruntimelambda2A0BEC8AArn",
    "expression": {
      "Fn::GetAtt": [
        "twitchruntimelambdaE27C0484",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-twitchruntimelambdaE27C0-gJY54R6xgECA"
  }
]
```

<a id="record-32"></a>

## 32. HttpApiPOSTwebhooksrevolutMyFunctionIntegrationPermissionC877F07A

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPOSTwebhooksrevolutMyFunctionIntegra-1SCF0PuDkUuW`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/webhooks/revolut"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/webhooks/revolut"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/webhooks/revolut",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/webhooks/revolut",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "webhooks/revolut",
  "paymentOrFulfillment": true,
  "webhook": true,
  "twitch": false,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-33"></a>

## 33. HttpApiPUTtwitchcommandsmeMyFunctionIntegrationPermission5A843795

- Physical ID: `amplify-projectrespawnwebsite-Ntgre-sandbox-HttpApiPUTtwitchcommandsmeMyFunctionIntegra-Ql9d5ztWVPce`
- Nested scope: `$root/apistack7B433BC7`
- AWS action/replacement: Modify / True
- Classification: **SEMANTICALLY_EQUIVALENT_REPLACEMENT**
- Template identical: true; effective properties identical: true
- Current service check: exact match = true
- Runtime effect: If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "ParameterReference",
    "CausingEntity": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
  },
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "FunctionName",
      "RequiresRecreation": "Always",
      "Path": "/Properties/FunctionName",
      "BeforeValue": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
      "AfterValue": "{{changeSet:KNOWN_AFTER_APPLY}}",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Dynamic",
    "ChangeSource": "DirectModification"
  }
]
```

Each property was compared independently against the deployed template, pinned template, AWS change set and live policy. Exact templates and resolved values:

```json
{
  "FunctionName": {
    "beforeTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "afterTemplate": {
      "Ref": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
    },
    "beforeKind": "Ref",
    "afterKind": "Ref",
    "beforeEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "afterEffective": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "identical": true
  },
  "Action": {
    "beforeTemplate": "lambda:InvokeFunction",
    "afterTemplate": "lambda:InvokeFunction",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "lambda:InvokeFunction",
    "afterEffective": "lambda:InvokeFunction",
    "identical": true
  },
  "Principal": {
    "beforeTemplate": "apigateway.amazonaws.com",
    "afterTemplate": "apigateway.amazonaws.com",
    "beforeKind": "literal",
    "afterKind": "literal",
    "beforeEffective": "apigateway.amazonaws.com",
    "afterEffective": "apigateway.amazonaws.com",
    "identical": true
  },
  "SourceArn": {
    "beforeTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands/me"
        ]
      ]
    },
    "afterTemplate": {
      "Fn::Join": [
        "",
        [
          "arn:",
          {
            "Ref": "AWS::Partition"
          },
          ":execute-api:",
          {
            "Ref": "AWS::Region"
          },
          ":",
          {
            "Ref": "AWS::AccountId"
          },
          ":",
          {
            "Ref": "HttpApiF5A9A8A7"
          },
          "/*/*/twitch/commands/me"
        ]
      ]
    },
    "beforeKind": "Fn::Join",
    "afterKind": "Fn::Join",
    "beforeEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands/me",
    "afterEffective": "arn:aws:execute-api:eu-north-1:058264289478:jm15a0rmi0/*/*/twitch/commands/me",
    "identical": true
  },
  "SourceAccount": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "PrincipalOrgID": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "FunctionUrlAuthType": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "InvokedViaFunctionUrl": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  },
  "EventSourceToken": {
    "beforeTemplate": null,
    "afterTemplate": null,
    "beforeKind": "absent",
    "afterKind": "absent",
    "beforeEffective": null,
    "afterEffective": null,
    "identical": true
  }
}
```

Individual runtime and overlap assessment:

```json
{
  "sameLambda": true,
  "samePrincipal": true,
  "sameSourceArn": true,
  "broadens": false,
  "narrows": false,
  "replacementTrigger": "FunctionName: Static ParameterReference and Dynamic DirectModification, RequiresRecreation=Always; after AWS value is KNOWN_AFTER_APPLY, not a new observed ARN",
  "strategy": "create_then_delete (regional schema omits override; documented resource-schema default)",
  "removeBeforeCreate": "Not the declared replacement strategy. RemovePermission identifies the old statement ID; new permission has a different generated ID.",
  "plannedInvocationGap": false,
  "canGuaranteeNoOperationalFailure": false,
  "runtimeEffect": "If performed, replace the statement identity, retaining identical invocation grant. Normal create-before-delete keeps the old grant during creation. Standard service/rollback failures remain possible.",
  "endpoint": "twitch/commands/me",
  "paymentOrFulfillment": false,
  "webhook": false,
  "twitch": true,
  "overlapHeadroom": {
    "currentBytes": 9734,
    "fullOverlapBytes": 19415,
    "quotaBytes": 20480
  }
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "parameter",
    "stack": "$root/apistack7B433BC7",
    "name": "referencetoamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332dataNestedStackdataNestedStackResource56E5212EOutputsamplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "parent": "$root",
    "binding": {
      "Fn::GetAtt": [
        "data7552DF31",
        "Outputs.amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn"
      ]
    },
    "bindingKind": "Fn::GetAtt",
    "bindingUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "equalToLive": true
  },
  {
    "kind": "resource-ref",
    "stack": "$root/apistack7B433BC7",
    "id": "HttpApiF5A9A8A7",
    "type": "AWS::ApiGatewayV2::Api",
    "physicalId": "jm15a0rmi0",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "myFunctionrebuildlambdaFBFF6F05",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "nested-output",
    "parent": "$root",
    "child": "$root/data7552DF31",
    "id": "data7552DF31",
    "name": "amplifyprojectrespawnwebsiteNtgresandbox8bd9d02332datamyFunctionrebuildlambda0842A303Arn",
    "expression": {
      "Fn::GetAtt": [
        "myFunctionrebuildlambdaFBFF6F05",
        "Arn"
      ]
    },
    "expressionUnchanged": true,
    "observed": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV",
    "resolved": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV"
  }
]
```

<a id="record-34"></a>

## 34. amplifyDataAmplifyCodegenAssetsAmplifyCodegenAssetsDeploymentCustomResource1536MiB21775929

- Physical ID: `aws.cdk.s3deployment.337d9c7c-ffc8-4128-9fdc-224e7d51472a`
- Nested scope: `$root/data7552DF31`
- AWS action/replacement: Modify / Conditional
- Classification: **EXPECTED_PHASE1_CHANGE_NOT_PREVIOUSLY_ACCOUNTED**
- Template identical: false; effective properties identical: false
- Current service check: stack/reference or provider evidence; see main report
- Runtime effect: Overwrite existing generated model-schema.graphql only; same key, no prune candidates at observation, same physical custom-resource ID on successful Update. No application runtime dependency or user data found.

AWS changed properties and evaluation (AWS `DirectModification` is preserved even when the submitted template did not change):

```json
[
  {
    "Target": {
      "Attribute": "Properties",
      "Name": "SourceObjectKeys",
      "RequiresRecreation": "Conditionally",
      "Path": "/Properties/SourceObjectKeys/0",
      "BeforeValue": "eafe20679f70756b9ce3a143c5eb5ca4f8a01c132f2e120b943950c7151e57a9.zip",
      "AfterValue": "3f867a5c8adc0cf7706f1c77085026271f6e937c8357fc2ed06d2b97f680c31d.zip",
      "AttributeChangeType": "Modify"
    },
    "Evaluation": "Static",
    "ChangeSource": "DirectModification"
  }
]
```

Exact effective BEFORE:

```json
{
  "ServiceToken": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-CustomCDKBucketDeploymen-BSbtrADfUoKE",
  "SourceBucketNames": [
    "cdk-hnb659fds-assets-058264289478-eu-north-1"
  ],
  "SourceObjectKeys": [
    "eafe20679f70756b9ce3a143c5eb5ca4f8a01c132f2e120b943950c7151e57a9.zip"
  ],
  "SourceMarkers": [
    {}
  ],
  "DestinationBucketName": "amplify-projectrespawnweb-amplifydataamplifycodege-beazicm78fjx",
  "WaitForDistributionInvalidation": true,
  "Prune": true,
  "OutputObjectKeys": true,
  "DestinationBucketArn": "arn:aws:s3:::amplify-projectrespawnweb-amplifydataamplifycodege-beazicm78fjx"
}
```

Exact effective AFTER:

```json
{
  "ServiceToken": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-CustomCDKBucketDeploymen-BSbtrADfUoKE",
  "SourceBucketNames": [
    "cdk-hnb659fds-assets-058264289478-eu-north-1"
  ],
  "SourceObjectKeys": [
    "3f867a5c8adc0cf7706f1c77085026271f6e937c8357fc2ed06d2b97f680c31d.zip"
  ],
  "SourceMarkers": [
    {}
  ],
  "DestinationBucketName": "amplify-projectrespawnweb-amplifydataamplifycodege-beazicm78fjx",
  "WaitForDistributionInvalidation": true,
  "Prune": true,
  "OutputObjectKeys": true,
  "DestinationBucketArn": "arn:aws:s3:::amplify-projectrespawnweb-amplifydataamplifycodege-beazicm78fjx"
}
```

Dependency/reference chain (full expression, binding, observed output and referenced-resource change status):

```json
[
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "CustomCDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C1536MiBC5D8AB21",
    "type": "AWS::Lambda::Function",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-CustomCDKBucketDeploymen-BSbtrADfUoKE",
    "value": "arn:aws:lambda:eu-north-1:058264289478:function:amplify-projectrespawnweb-CustomCDKBucketDeploymen-BSbtrADfUoKE",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-ref",
    "stack": "$root/data7552DF31",
    "id": "amplifyDataAmplifyCodegenAssetsAmplifyCodegenAssetsBucket9CCB4ACA",
    "type": "AWS::S3::Bucket",
    "physicalId": "amplify-projectrespawnweb-amplifydataamplifycodege-beazicm78fjx",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  },
  {
    "kind": "resource-attribute",
    "stack": "$root/data7552DF31",
    "id": "amplifyDataAmplifyCodegenAssetsAmplifyCodegenAssetsBucket9CCB4ACA",
    "type": "AWS::S3::Bucket",
    "attribute": "Arn",
    "physicalId": "amplify-projectrespawnweb-amplifydataamplifycodege-beazicm78fjx",
    "value": "arn:aws:s3:::amplify-projectrespawnweb-amplifydataamplifycodege-beazicm78fjx",
    "definitionUnchanged": true,
    "awsAction": "None",
    "awsReplacement": "None"
  }
]
```
