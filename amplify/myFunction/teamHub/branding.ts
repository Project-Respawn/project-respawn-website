import { randomUUID } from 'node:crypto'
import { inflateSync } from 'node:zlib'
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const MAX_LOGO_BYTES = 2 * 1024 * 1024
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const TEAM_KEY = /^team-logos\/(team:[a-z0-9]+(?:-[a-z0-9]+)*)\/([0-9a-f-]{36})\.png$/

function crc32(buffer: Buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

export function assertTeamLogoKey(key: unknown, teamId: string) {
  const value = typeof key === 'string' ? key : ''
  const match = TEAM_KEY.exec(value)
  if (!match || match[1] !== teamId) throw new Error('Invalid team logo key')
  return value
}

export function validatePng(buffer: Buffer) {
  if (buffer.length > MAX_LOGO_BYTES) throw new Error('Team logo exceeds 2 MB')
  if (buffer.length < 45 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('Invalid PNG image')
  let offset = 8, width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0, sawIhdr = false, sawIend = false
  const compressed: Buffer[] = []
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    if (length > MAX_LOGO_BYTES || offset + 12 + length > buffer.length) throw new Error('Corrupt PNG image')
    const type = buffer.subarray(offset + 4, offset + 8)
    const data = buffer.subarray(offset + 8, offset + 8 + length)
    const expectedCrc = buffer.readUInt32BE(offset + 8 + length)
    if (crc32(Buffer.concat([type, data])) !== expectedCrc) throw new Error('Corrupt PNG image')
    const name = type.toString('ascii')
    if (!sawIhdr && name !== 'IHDR') throw new Error('Invalid PNG image')
    if (name === 'IHDR') {
      if (sawIhdr || length !== 13) throw new Error('Invalid PNG image')
      sawIhdr = true; width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]
      if (data[10] !== 0 || data[11] !== 0 || ![0, 2, 3, 4, 6].includes(colorType) || ![1, 2, 4, 8, 16].includes(bitDepth)) throw new Error('Invalid PNG image')
    } else if (name === 'IDAT') compressed.push(data)
    else if (name === 'IEND') { if (length !== 0) throw new Error('Corrupt PNG image'); sawIend = true; offset += 12; break }
    offset += 12 + length
  }
  if (!sawIhdr || !sawIend || offset !== buffer.length || !compressed.length) throw new Error('Corrupt PNG image')
  if (width < 256 || height < 256 || width > 2048 || height > 2048) throw new Error('Team logo dimensions must be between 256 and 2048 pixels')
  if (interlace !== 0) throw new Error('Interlaced PNG images are not supported')
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[colorType]
  const rowBytes = Math.ceil(width * channels * bitDepth / 8)
  let decoded: Buffer
  try { decoded = inflateSync(Buffer.concat(compressed), { maxOutputLength: (rowBytes + 1) * height }) } catch { throw new Error('Corrupt PNG image') }
  if (decoded.length !== (rowBytes + 1) * height) throw new Error('Corrupt PNG image')
  for (let row = 0; row < height; row += 1) if (decoded[row * (rowBytes + 1)] > 4) throw new Error('Corrupt PNG image')
  return { width, height, square: width === height }
}

export function storageClient() { return new S3Client({}) }
export function logoBucket(environment: NodeJS.ProcessEnv = process.env) {
  const value = environment.TEAM_HUB_LOGO_BUCKET
  if (!value) throw new Error('Team logo storage is unavailable')
  return value
}
export function createLogoKey(teamId: string) { return `team-logos/${teamId}/${randomUUID()}.png` }
export async function createLogoUpload(storage: any, bucket: string, teamId: string, fileName: unknown, contentType: unknown, size: unknown) {
  if (typeof fileName !== 'string' || !fileName.toLowerCase().endsWith('.png') || contentType !== 'image/png' || !Number.isInteger(size) || Number(size) < 1 || Number(size) > MAX_LOGO_BYTES) throw new Error('Invalid PNG upload')
  const key = createLogoKey(teamId)
  const uploadUrl = await getSignedUrl(storage, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: 'image/png', ContentLength: Number(size) }), { expiresIn: 300 })
  return { key, uploadUrl, expiresIn: 300 }
}
export async function verifyStoredLogo(storage: any, bucket: string, key: string, teamId: string) {
  assertTeamLogoKey(key, teamId)
  const head = await storage.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  if (head.ContentType !== 'image/png' || Number(head.ContentLength) < 1 || Number(head.ContentLength) > MAX_LOGO_BYTES) throw new Error('Invalid PNG upload')
  const object = await storage.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  const bytes = Buffer.from(await object.Body.transformToByteArray())
  return validatePng(bytes)
}
export async function logoDisplayUrl(storage: any, bucket: string, key: unknown, teamId: string) {
  if (!key) return null
  const safeKey = assertTeamLogoKey(key, teamId)
  return getSignedUrl(storage, new GetObjectCommand({ Bucket: bucket, Key: safeKey }), { expiresIn: 3600 })
}
export async function deleteLogo(storage: any, bucket: string, key: unknown, teamId: string) {
  if (!key) return
  await storage.send(new DeleteObjectCommand({ Bucket: bucket, Key: assertTeamLogoKey(key, teamId) }))
}
