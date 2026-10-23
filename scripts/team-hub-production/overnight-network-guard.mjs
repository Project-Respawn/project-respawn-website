// Unit tests may replace fetch with mocks; only loopback real requests are allowed.
import net from 'node:net';import tls from 'node:tls';import {syncBuiltinESMExports} from 'node:module';
const fail=()=>{throw Error('OVERNIGHT_PROVIDER_NETWORK_FORBIDDEN');};
const fetchOriginal=globalThis.fetch;
globalThis.fetch=(input,...rest)=>{const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname))fail();return fetchOriginal(input,...rest);};
net.connect=net.createConnection=tls.connect=fail;syncBuiltinESMExports();
process.env.AWS_ACCESS_KEY_ID='LOCAL_TEST_ONLY';process.env.AWS_SECRET_ACCESS_KEY='LOCAL_TEST_ONLY';process.env.AWS_EC2_METADATA_DISABLED='true';process.env.AWS_MAX_ATTEMPTS='1';delete process.env.AWS_SESSION_TOKEN;delete process.env.AWS_PROFILE;delete process.env.AWS_DEFAULT_PROFILE;
