// Work around Node 24 failing os.userInfo() in some restricted Windows runners
// before tsx chooses its temporary directory.
if (typeof process.geteuid !== 'function') process.geteuid = () => 1000;

const { register } = await import('tsx/esm/api');
register();
await import('../amplify/myFunction/teamHub/teamHub.test.ts');
await import('../amplify/myFunction/teamHub/gateway.test.ts');
