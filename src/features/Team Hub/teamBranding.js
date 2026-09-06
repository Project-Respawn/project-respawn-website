export const MAX_TEAM_LOGO_BYTES = 2 * 1024 * 1024;
const PNG = [137, 80, 78, 71, 13, 10, 26, 10];

export async function validateTeamLogoFile(file, decode = async (candidate) => {
  const bitmap = await createImageBitmap(candidate);
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
}) {
  if (!file || !String(file.name).toLowerCase().endsWith('.png') || file.type !== 'image/png') throw new Error('Choose a PNG file.');
  if (file.size < 1 || file.size > MAX_TEAM_LOGO_BYTES) throw new Error('PNG must be no larger than 2 MB.');
  const bytes = new Uint8Array(await file.slice(0, 24).arrayBuffer());
  if (PNG.some((byte, index) => bytes[index] !== byte)) throw new Error('The selected file is not a genuine PNG.');
  let dimensions;
  try { dimensions = await decode(file); } catch { throw new Error('The PNG is corrupt or cannot be decoded.'); }
  if (dimensions.width < 256 || dimensions.height < 256 || dimensions.width > 2048 || dimensions.height > 2048) throw new Error('PNG dimensions must be between 256 × 256 and 2048 × 2048.');
  return { ...dimensions, square: dimensions.width === dimensions.height };
}
