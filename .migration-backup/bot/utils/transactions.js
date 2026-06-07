const path = require('path');
const { readJSON, writeJSON } = require('./storage');

const TRANSACTIONS_PATH = path.join(__dirname, '..', 'data', 'transactions.json');

function createTransactionId() {
  return `RSA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function loadTransactions() {
  const data = await readJSON(TRANSACTIONS_PATH, { transactions: [] });
  return data.transactions || [];
}

async function saveTransactions(transactions) {
  await writeJSON(TRANSACTIONS_PATH, { transactions });
}

async function addTransaction(transaction) {
  const transactions = await loadTransactions();
  transactions.push(transaction);
  await saveTransactions(transactions);
  return transaction;
}

async function getTransactionById(transactionId) {
  const transactions = await loadTransactions();
  return transactions.find((item) => item.id === transactionId);
}

async function findSignTransactionForPlayer(playerId, teamCode) {
  const transactions = await loadTransactions();
  return transactions
    .filter((item) => item.type === 'sign' && item.playerId === playerId && item.teamCode === teamCode)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
}

async function getRecentTransactions(limit = 25) {
  const transactions = await loadTransactions();
  return transactions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

module.exports = {
  createTransactionId,
  loadTransactions,
  saveTransactions,
  addTransaction,
  getTransactionById,
  findSignTransactionForPlayer,
  getRecentTransactions,
};
