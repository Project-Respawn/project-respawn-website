// Scan prospective or staged files without printing matched secret values.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const staged=process.argv.includes('--staged');
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:50*1024*1024});
const files=[...new Set((staged?git(['diff','--cached','--name-only','-z','--diff-filter=ACMR']):git(['ls-files','--others','--exclude-standard','-z'])+git(['diff','--name-only','-z'])).split('\0').filter(Boolean))];
const rules=[
 ['AWS access key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
 ['JWT value',/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{16,}\b/g],
 ['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
 ['GitHub token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g],
 ['literal AWS secret',/["']?(?:SecretAccessKey|SessionToken|aws_secret_access_key|aws_session_token)["']?\s*[:=]\s*["'][A-Za-z0-9+/=]{30,}["']/gi],
 ['literal credential',/["'](?:password|client_secret|refresh_token|access_token|id_token)["']\s*:\s*["'][^"'\s]{12,}["']/gi]
];
const findings=[];let bytes=0;
for(const p of files){
 if(/(^|\/)(node_modules|\.aws|\.build|\.codex-worktrees|cdk\.out)(\/|$)|(^|\/)\.env(?!\.example$)|\.(pem|p12|pfx|key|tfstate)$/.test(p))findings.push({path:p,rule:'excluded sensitive/cache path'});
 const text=staged?git(['show',':'+p]):fs.readFileSync(p,'utf8');bytes+=Buffer.byteLength(text);
 for(const [name,regex] of rules){regex.lastIndex=0;if(regex.test(text))findings.push({path:p,rule:name});}
}
console.log(JSON.stringify({scope:staged?'staged':'prospective',files:files.length,bytes,findings},null,2));assert.equal(findings.length,0,'Review flagged paths; secret values withheld');
