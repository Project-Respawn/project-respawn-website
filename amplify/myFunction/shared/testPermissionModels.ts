export function testPermissionModels(permissionKeys: string[], groups = ['SuperAdmin', 'Admin', 'Staff']) {
  return {
    PermissionDefinition: {
      list: async () => ({ data: permissionKeys.map((key) => ({ key, isActive: true })) }),
    },
    GroupPermission: {
      list: async () => ({
        data: groups.flatMap((groupName) => permissionKeys.map((permissionKey) => ({
          groupName,
          permissionKey,
          enabled: true,
        }))),
      }),
    },
  }
}
