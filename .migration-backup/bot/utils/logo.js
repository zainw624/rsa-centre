const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { AttachmentBuilder } = require('discord.js');

const LOGO_CANVAS_SIZE = 512;
const ALPHA_MIN_THRESHOLD = 12;
const CACHE_DIRECTORY = path.join(__dirname, '..', 'temp', 'logos');
const DEFAULT_FALLBACK_LOGO = path.join(__dirname, '..', 'assets', 'rsa1.png');

function makeSafeFileName(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'team-logo';
}

async function resolveSourceLogoPath(team) {
  if (!team || typeof team !== 'object') {
    throw new Error('Team logo not configured');
  }

  const candidate = team.logo
    ? path.isAbsolute(team.logo)
      ? team.logo
      : path.join(__dirname, '..', team.logo)
    : null;

  if (candidate) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch (_) {
      // Fall through to fallback
    }
  }

  try {
    await fs.access(DEFAULT_FALLBACK_LOGO);
    return DEFAULT_FALLBACK_LOGO;
  } catch (_) {
    return null;
  }
}

async function ensureCacheDirectory() {
  await fs.mkdir(CACHE_DIRECTORY, { recursive: true });
}

async function shouldRegenerateCache(sourcePath, cachePath) {
  try {
    const [sourceStats, cacheStats] = await Promise.all([fs.stat(sourcePath), fs.stat(cachePath)]);
    return sourceStats.mtimeMs > cacheStats.mtimeMs;
  } catch {
    return true;
  }
}

async function createCircularLogoBuffer(sourcePath) {
  const logo = sourcePath
    ? sharp(sourcePath).ensureAlpha().trim()
    : sharp({ create: { width: LOGO_CANVAS_SIZE, height: LOGO_CANVAS_SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });

  const circleMask = Buffer.from(
    `<svg width="${LOGO_CANVAS_SIZE}" height="${LOGO_CANVAS_SIZE}"><circle cx="${LOGO_CANVAS_SIZE / 2}" cy="${LOGO_CANVAS_SIZE / 2}" r="${LOGO_CANVAS_SIZE / 2 - 4}" fill="#ffffff" /></svg>`
  );

  const rawBuffer = await logo
    .resize({
      width: LOGO_CANVAS_SIZE,
      height: LOGO_CANVAS_SIZE,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const { data, info } = await sharp(rawBuffer).raw().toBuffer({ resolveWithObject: true });
  const pixelBuffer = Buffer.from(data);
  if (info.channels === 4) {
    for (let i = 0; i < pixelBuffer.length; i += 4) {
      const alpha = pixelBuffer[i + 3];
      if (alpha > 0 && alpha < ALPHA_MIN_THRESHOLD) {
        pixelBuffer[i + 3] = 0;
      }
    }
  }

  const cleanedBuffer = await sharp(pixelBuffer, { raw: info })
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toBuffer();

  return cleanedBuffer;
}

async function getProcessedLogoAttachment(team) {
  await ensureCacheDirectory();

  const safeName = makeSafeFileName(team.teamCode || team.teamId || team.teamName || 'team');
  const cachePath = path.join(CACHE_DIRECTORY, `${safeName}-logo.png`);
  const sourcePath = await resolveSourceLogoPath(team);

  let attachmentSource = cachePath;
  if (!sourcePath || (await shouldRegenerateCache(sourcePath, cachePath))) {
    const buffer = await createCircularLogoBuffer(sourcePath);
    await fs.writeFile(cachePath, buffer);
  }

  return new AttachmentBuilder(attachmentSource, { name: `${safeName}-logo.png` });
}

module.exports = {
  getProcessedLogoAttachment,
};
