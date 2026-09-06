import test from 'node:test'
import assert from 'node:assert/strict'
import { deflateSync } from 'node:zlib'
import { assertTeamLogoKey, validatePng } from './branding'

function crc32(buffer: Buffer) { let crc=0xffffffff; for(const byte of buffer){crc^=byte;for(let bit=0;bit<8;bit+=1)crc=(crc>>>1)^(0xedb88320&-(crc&1))} return (crc^0xffffffff)>>>0 }
function chunk(name: string, data: Buffer) { const type=Buffer.from(name); const out=Buffer.alloc(data.length+12); out.writeUInt32BE(data.length); type.copy(out,4); data.copy(out,8); out.writeUInt32BE(crc32(Buffer.concat([type,data])),8+data.length); return out }
function png(width=256,height=256) { const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6; const rows=Buffer.alloc((width*4+1)*height); return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]) }

test('server accepts a completely decoded valid PNG and reports square presentation',()=>assert.deepEqual(validatePng(png()),{width:256,height:256,square:true}))
test('server rejects spoofed, corrupt, truncated, undersized, oversized and excessive PNGs',()=>{
  assert.throws(()=>validatePng(Buffer.from('not png')),/Invalid PNG/)
  const corrupt=png();corrupt[corrupt.length-1]^=1;assert.throws(()=>validatePng(corrupt),/Corrupt PNG/)
  assert.throws(()=>validatePng(png().subarray(0,-5)),/Corrupt PNG/)
  assert.throws(()=>validatePng(png(255,256)),/dimensions/)
  assert.throws(()=>validatePng(png(2049,256)),/dimensions/)
  assert.throws(()=>validatePng(Buffer.alloc(2*1024*1024+1)),/2 MB/)
})
test('only immutable keys beneath the exact team prefix can be attached',()=>{
  const key='team-logos/team:alpha/123e4567-e89b-12d3-a456-426614174000.png';assert.equal(assertTeamLogoKey(key,'team:alpha'),key)
  assert.throws(()=>assertTeamLogoKey(key,'team:beta'),/Invalid team logo key/);assert.throws(()=>assertTeamLogoKey('team-logos/team:alpha/logo.svg','team:alpha'),/Invalid team logo key/)
})
