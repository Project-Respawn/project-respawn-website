import net from 'node:net';
import assert from 'node:assert/strict';
const pipe=process.argv[2];
assert.match(pipe,/^respawn-b4b-auth-[a-f0-9]{32}$/);
assert.ok(process.stdin.isTTY);
process.stdin.setRawMode(true);process.stdin.resume();
console.log('Secure input ready (no echo).');
let value='';
process.stdin.on('data',data=>{for(const char of data.toString()){
  if(char==='\u0003')process.exit(1);
  if(char==='\r'||char==='\n'){
    process.stdin.removeAllListeners('data');process.stdin.pause();
    const socket=net.connect(49183,'127.0.0.1',()=>{socket.end(pipe+'\n'+value);value='';});
    socket.on('error',()=>{console.log('Private channel unavailable.');process.exit(1)});
    socket.on('close',()=>{process.stdin.setRawMode(false);console.log('Private input delivered.');process.exit(0)});
    return;
  }
  value+=char;
}});
