const fs = require('fs').promises;

async function ensureFile(path, defaultContent = '{}') {
  try {
    await fs.access(path);
  } catch {
    await fs.writeFile(path, defaultContent, 'utf8');
  }
}

async function readJSON(path, defaultValue = {}) {
  await ensureFile(path, JSON.stringify(defaultValue, null, 2));
  const raw = await fs.readFile(path, 'utf8');
  try {
    return JSON.parse(raw || JSON.stringify(defaultValue));
  } catch (error) {
    console.error(`Failed to parse JSON from ${path}:`, error);
    return defaultValue;
  }
}

async function writeJSON(path, value) {
  await fs.writeFile(path, JSON.stringify(value, null, 2), 'utf8');
}

module.exports = {
  ensureFile,
  readJSON,
  writeJSON,
};
