import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
const deny = () => { throw new Error('Offline Commerce validation forbids network access') }
globalThis.fetch=deny;http.get=deny;http.request=deny;https.get=deny;https.request=deny;net.Socket.prototype.connect=deny
process.env.AWS_EC2_METADATA_DISABLED='true'
process.env.AWS_CONFIG_FILE=process.cwd()+'/.amplify/no-aws-config'
process.env.AWS_SHARED_CREDENTIALS_FILE=process.cwd()+'/.amplify/no-aws-credentials'
for(const name of ['AWS_PROFILE','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_SESSION_TOKEN'])delete process.env[name]
if(typeof process.geteuid!=='function')process.geteuid=()=>1000
