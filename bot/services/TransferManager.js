const transferStore = require('../storage/TransferStore');

class TransferManager {
  constructor() {
    this.transfers = [];
  }

  async initialize() {
    const data = await transferStore.load();
    this.transfers = Array.isArray(data.transfers) ? data.transfers : [];
  }

  async validateTransfers() {
    const errors = [];
    if (!Array.isArray(this.transfers)) {
      errors.push('Transfers must be an array');
      return errors;
    }
    for (const transfer of this.transfers) {
      if (!transfer.playerId || !transfer.fromTeam || !transfer.toTeam) {
        errors.push(`Invalid transfer record: ${JSON.stringify(transfer)}`);
      }
    }
    return errors;
  }

  async addTransfer(transfer) {
    if (!transfer || !transfer.playerId || !transfer.fromTeam || !transfer.toTeam) {
      throw new Error('Transfer record must include playerId, fromTeam, and toTeam');
    }
    
    const newTransfer = {
      id: transfer.id || `transfer_${Date.now()}`,
      playerId: transfer.playerId,
      playerName: transfer.playerName || 'Unknown',
      fromTeam: transfer.fromTeam,
      toTeam: transfer.toTeam,
      type: transfer.type || 'sign',
      status: transfer.status || 'pending',
      createdAt: transfer.createdAt || new Date().toISOString(),
      completedAt: transfer.completedAt || null,
      windowOpen: transfer.windowOpen !== undefined ? transfer.windowOpen : true,
    };
    
    this.transfers.push(newTransfer);
    await this.syncTransfers();
    return newTransfer;
  }

  getAllTransfers() {
    return this.transfers || [];
  }

  getTransfersByStatus(status) {
    if (!status) return this.transfers;
    return this.transfers.filter((t) => t.status === status);
  }

  getTransfersByTeam(teamName) {
    if (!teamName) return [];
    return this.transfers.filter((t) => t.fromTeam === teamName || t.toTeam === teamName);
  }

  getTransfersByPlayer(playerId) {
    if (!playerId) return [];
    return this.transfers.filter((t) => t.playerId === playerId);
  }

  getPendingTransfers() {
    return this.getTransfersByStatus('pending');
  }

  getCompletedTransfers() {
    return this.getTransfersByStatus('completed');
  }

  getRejectedTransfers() {
    return this.getTransfersByStatus('rejected');
  }

  async updateTransferStatus(transferId, newStatus) {
    const transfer = this.transfers.find((t) => t.id === transferId);
    if (!transfer) return null;

    transfer.status = newStatus;
    if (newStatus === 'completed') {
      transfer.completedAt = new Date().toISOString();
    }

    await this.syncTransfers();
    return transfer;
  }

  async removeTransfer(transferId) {
    const index = this.transfers.findIndex((t) => t.id === transferId);
    if (index === -1) return false;

    this.transfers.splice(index, 1);
    await this.syncTransfers();
    return true;
  }

  async syncTransfers() {
    await transferStore.save({ 
      transfers: this.transfers || [],
      lastUpdated: new Date().toISOString(),
    });
  }
}

module.exports = TransferManager;
