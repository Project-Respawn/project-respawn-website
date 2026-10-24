# Ntgre Team Hub local development binding

The signed-in browser reported TeamHubMigration / TEAM_HUB_MAINTENANCE, which the Legacy service had converted to a generic request failure. The main Vite configuration still selected Legacy although the accepted 14 October cutover installed its fences and activated independent Team Hub. This was not evidence that the owner had lost Admin membership.

A fresh strong authority read confirms TARGET_WRITER, epoch/version 5/5. The accepted epoch-5 frontend manifest hash is 3c4a04c630636d11a3235314c87699aa406b2451fd15a29e1d7be1cd5ba01bdf. The original proposal and historical artifacts remain unchanged.

The main-folder npm run dev workflow now uses serve-only aliases to the existing independent service and migration-mode exports, with the previously reviewed activation binding copied into frontend-development.Ntgre.json. Strict account, region, endpoint and Cognito checks reject another environment. Every request still reads actual authority status and validates epoch, authorization and business contracts; no Legacy fallback or permission bypass is introduced. Production builds receive none of these aliases. Dependency discovery starts at the real index.html rather than archived preview pages.

No AWS write, authority update, fence removal, Cognito mutation or production publication occurred. The temporary local diagnostic hook was removed after capturing the service error; no credentials were collected. Existing local outputs were preserved. Tests cover accepted development binding, wrong identities/endpoints/epochs and production-build exclusion. Authenticated browser acceptance awaits the owner's refresh.
