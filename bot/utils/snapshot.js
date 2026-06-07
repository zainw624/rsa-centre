const fs = require('fs').promises;
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');
const TEAMS_PATH = path.join(__dirname, '..', 'data', 'teams.json');
const TRANSACTIONS_PATH = path.join(__dirname, '..', 'data', 'transactions.json');
const SETTINGS_PATH = path.join(__dirname, '..', 'data', 'settings.json');

function formatTimestamp(date = new Date()) {
  return date.toISOString().replace(/:/g, '-').split('.')[0];
}

async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

async function createSnapshot(label = 'snapshot') {
  await ensureBackupDir();
  const timestamp = formatTimestamp(new Date());
  const suffix = `${label}-${timestamp}`;
  const files = [
    { source: TEAMS_PATH, name: `teams-${suffix}.json` },
    { source: TRANSACTIONS_PATH, name: `transactions-${suffix}.json` },
    { source: SETTINGS_PATH, name: `settings-${suffix}.json` },
  ];

  const createdFiles = [];
  for (const file of files) {
    const destination = path.join(BACKUP_DIR, file.name);
    await fs.copyFile(file.source, destination);
    createdFiles.push(destination);
  }

  return {
    timestamp,
    suffix,
    files: createdFiles,
  };
}

async function listSnapshots() {
  await ensureBackupDir();
  const files = await fs.readdir(BACKUP_DIR);
  return files
    .filter((file) => file.endsWith('.json'))
    .sort()
    .reduce((acc, file) => {
      const key = file.replace(/^(teams|transactions|settings)-/, '').replace(/\.json$/, '');
      if (!acc.includes(key)) acc.push(key);
      return acc;
    }, []);
}

function getSnapshotFilePaths(snapshotId) {
  const id = snapshotId.replace(/\.json$/, '');
  return {
    teams: `teams-${id}.json`,
    transactions: `transactions-${id}.json`,
    settings: `settings-${id}.json`,
  };
}

async function snapshotExists(snapshotId) {
  await ensureBackupDir();
  const { teams, transactions, settings } = getSnapshotFilePaths(snapshotId);
  const existing = await fs.readdir(BACKUP_DIR);
  return [teams, transactions, settings].every((name) => existing.includes(name));
}

async function findMatchingSnapshotId(snapshotId) {
  await ensureBackupDir();
  const files = await fs.readdir(BACKUP_DIR);
  const exact = files.find((file) => file === snapshotId || file === `${snapshotId}.json`);
  if (exact) {
    const id = exact.replace(/^(teams|transactions|settings)-/, '').replace(/\.json$/, '');
    return id;
  }

  const directId = snapshotId.replace(/\.json$/, '');
  const candidates = files.filter((file) => file.includes(`-${directId}.json`));
  if (candidates.length >= 3) {
    return directId;
  }

  const matchingId = files
    .map((file) => file.replace(/^(teams|transactions|settings)-/, '').replace(/\.json$/, ''))
    .find((id) => id.includes(directId));
  return matchingId || null;
}

async function restoreSnapshot(snapshotId) {
  const resolvedId = await findMatchingSnapshotId(snapshotId);
  if (!resolvedId) {
    throw new Error(`Snapshot "${snapshotId}" not found.`);
  }

  const { teams, transactions, settings } = getSnapshotFilePaths(resolvedId);
  await ensureBackupDir();

  await fs.copyFile(path.join(BACKUP_DIR, teams), TEAMS_PATH);
  await fs.copyFile(path.join(BACKUP_DIR, transactions), TRANSACTIONS_PATH);
  await fs.copyFile(path.join(BACKUP_DIR, settings), SETTINGS_PATH);

  return resolvedId;
}

module.exports = {
  createSnapshot,
  listSnapshots,
  findMatchingSnapshotId,
  restoreSnapshot,
};
