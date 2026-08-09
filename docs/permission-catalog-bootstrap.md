# Production permission catalog bootstrap

Run this once after the backend deployment and before enabling the new dashboard for users. The operation is idempotent: it creates only missing catalog definitions and default group assignments, using stable IDs.

1. Sign in as an existing `SuperAdmin` (or `Admin`) and open the deployed AppSync API in the AWS console.
2. In **Queries**, authenticate with that user's Cognito token and run:

   ```graphql
   mutation BootstrapPermissions {
     seedPermissionCatalog {
       success
       message
       changedCount
     }
   }
   ```

3. Validate immediately with:

   ```graphql
   query ValidatePermissions {
     listPermissionCatalog {
       definitions
       groups
       assignments
     }
   }
   ```

4. Confirm every definition in `amplify/myFunction/permissions/index.ts` is present and active, and that the returned default assignments match each definition's `defaultGroups`. In particular, `users.manage` and `forums.structure.manage` must be assigned to `SuperAdmin`, not `Admin`.
5. Sign in as one representative user from each production role and verify `getMyAccessContext.permissions` before opening access to the dashboard.

Do not treat visiting `/dashboard/permissions` as the bootstrap mechanism. If the mutation or validation fails, stop the release and inspect the `myFunction` CloudWatch logs; do not manually create partial DynamoDB rows.
