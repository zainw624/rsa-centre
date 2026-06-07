const complianceStore = require('../storage/ComplianceStore');

class ComplianceEngine {
  constructor() {
    this.warnings = [];
    this.violations = [];
    this.lastScan = null;
  }

  async initialize() {
    const data = await complianceStore.load();
    this.warnings = data.warnings || [];
    this.violations = data.violations || [];
    this.lastScan = data.lastScan;
  }

  async sync() {
    await complianceStore.save({
      warnings: this.warnings,
      violations: this.violations,
      lastScan: this.lastScan,
    });
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // DETECTION METHODS
  // ════════════════════════════════════════════════════════════════════════════════

  detectDuplicateManagers(teams) {
    const violations = [];
    const managerMap = {};

    for (const team of teams) {
      if (!team.managerDiscordId) continue;

      if (!managerMap[team.managerDiscordId]) {
        managerMap[team.managerDiscordId] = [];
      }
      managerMap[team.managerDiscordId].push(team.teamName);
    }

    for (const [managerId, teams_list] of Object.entries(managerMap)) {
      if (teams_list.length > 1) {
        violations.push({
          type: 'DUPLICATE_MANAGER',
          severity: 'HIGH',
          managerId,
          teams: teams_list,
          message: `Manager <@${managerId}> is assigned to multiple teams: ${teams_list.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return violations;
  }

  detectDuplicateAssistants(teams) {
    const violations = [];
    const assistantMap = {};

    for (const team of teams) {
      if (!team.assistantsDiscordIds || team.assistantsDiscordIds.length === 0) continue;

      for (const assistantId of team.assistantsDiscordIds) {
        if (!assistantMap[assistantId]) {
          assistantMap[assistantId] = [];
        }
        assistantMap[assistantId].push(team.teamName);
      }
    }

    for (const [assistantId, teams_list] of Object.entries(assistantMap)) {
      if (teams_list.length > 1) {
        violations.push({
          type: 'DUPLICATE_ASSISTANT',
          severity: 'MEDIUM',
          assistantId,
          teams: teams_list,
          message: `Assistant <@${assistantId}> is assigned to multiple teams: ${teams_list.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return violations;
  }

  detectIllegalSignings(teams, transfers) {
    const violations = [];
    const validTransferMap = {};

    // Build a map of valid transfers
    for (const transfer of transfers) {
      if (transfer.type === 'sign' && transfer.status === 'completed') {
        const key = `${transfer.playerId}-${transfer.toTeam}`;
        validTransferMap[key] = transfer;
      }
    }

    // Check rosters against transfers
    for (const team of teams) {
      if (!team.rosterPlayers || team.rosterPlayers.length === 0) continue;

      for (const player of team.rosterPlayers) {
        const key = `${player.playerId}-${team.teamName}`;
        if (!validTransferMap[key]) {
          violations.push({
            type: 'ILLEGAL_SIGNING',
            severity: 'CRITICAL',
            playerId: player.playerId,
            playerName: player.playerName,
            team: team.teamName,
            message: `Player <@${player.playerId}> (${player.playerName}) on ${team.teamName} roster has no valid transfer record`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return violations;
  }

  detectCupTiedViolations(teams, guild, settings) {
    const violations = [];
    if (!guild || !settings.cupTiedRoleId) return violations;

    const cupTiedRole = guild.roles.cache.get(settings.cupTiedRoleId);
    if (!cupTiedRole) return violations;

    for (const team of teams) {
      if (!team.rosterPlayers || team.rosterPlayers.length === 0) continue;

      for (const player of team.rosterPlayers) {
        const member = guild.members.cache.get(player.playerId);
        if (member && member.roles.cache.has(cupTiedRole.id)) {
          violations.push({
            type: 'CUP_TIED_VIOLATION',
            severity: 'CRITICAL',
            playerId: player.playerId,
            playerName: player.playerName,
            team: team.teamName,
            message: `Cup Tied player <@${player.playerId}> (${player.playerName}) is still rostered for ${team.teamName}`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return violations;
  }

  detectTransferWindowViolations(transfers, transferWindowOpen) {
    const violations = [];

    for (const transfer of transfers) {
      if (transfer.type !== 'sign') continue;
      if (!transfer.completedAt) continue;

      // Check if transfer was completed outside transfer window
      const transferDate = new Date(transfer.completedAt);
      const wasWindowOpen = transfer.windowOpen !== undefined ? transfer.windowOpen : true;

      if (!wasWindowOpen && transfer.status === 'completed') {
        violations.push({
          type: 'TRANSFER_WINDOW_VIOLATION',
          severity: 'HIGH',
          transferId: transfer.id,
          playerId: transfer.playerId,
          playerName: transfer.playerName,
          team: transfer.toTeam,
          message: `Transfer ${transfer.id} was completed outside transfer window for <@${transfer.playerId}>`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return violations;
  }

  detectMissingManagers(teams) {
    const violations = [];

    for (const team of teams) {
      if (!team.managerDiscordId || team.managerDiscordId === '0' || team.managerDiscordId === '') {
        violations.push({
          type: 'MISSING_MANAGER',
          severity: 'MEDIUM',
          team: team.teamName,
          message: `${team.teamName} does not have a manager assigned`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return violations;
  }

  detectMissingAssistants(teams) {
    const violations = [];

    for (const team of teams) {
      if (!team.assistantsDiscordIds || team.assistantsDiscordIds.length === 0) {
        violations.push({
          type: 'MISSING_ASSISTANTS',
          severity: 'LOW',
          team: team.teamName,
          message: `${team.teamName} does not have any assistants assigned`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return violations;
  }

  detectRosterViolations(teams) {
    const violations = [];
    const playerMap = {};

    for (const team of teams) {
      if (!team.rosterPlayers || team.rosterPlayers.length === 0) continue;

      // Check roster size
      if (team.rosterPlayers.length > team.rosterLimit) {
        violations.push({
          type: 'ROSTER_OVERSIZED',
          severity: 'HIGH',
          team: team.teamName,
          current: team.rosterPlayers.length,
          limit: team.rosterLimit,
          message: `${team.teamName} roster is oversized: ${team.rosterPlayers.length}/${team.rosterLimit}`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check for duplicate players
      const teamPlayerMap = {};
      for (const player of team.rosterPlayers) {
        if (!teamPlayerMap[player.playerId]) {
          teamPlayerMap[player.playerId] = 0;
        }
        teamPlayerMap[player.playerId]++;
      }

      for (const [playerId, count] of Object.entries(teamPlayerMap)) {
        if (count > 1) {
          violations.push({
            type: 'DUPLICATE_ROSTER_ENTRY',
            severity: 'CRITICAL',
            team: team.teamName,
            playerId,
            count,
            message: `Player <@${playerId}> appears ${count} times in ${team.teamName} roster`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Check for players on multiple teams
      for (const player of team.rosterPlayers) {
        if (!playerMap[player.playerId]) {
          playerMap[player.playerId] = [];
        }
        playerMap[player.playerId].push(team.teamName);
      }
    }

    for (const [playerId, teams_list] of Object.entries(playerMap)) {
      if (teams_list.length > 1) {
        violations.push({
          type: 'PLAYER_MULTIPLE_TEAMS',
          severity: 'CRITICAL',
          playerId,
          teams: teams_list,
          message: `Player <@${playerId}> is rostered for multiple teams: ${teams_list.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return violations;
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // SCAN & REPORT
  // ════════════════════════════════════════════════════════════════════════════════

  async runComplianceScan(teams, transfers, guild, settings, transferWindowOpen) {
    const allViolations = [];

    // Run all detection methods
    allViolations.push(...this.detectDuplicateManagers(teams));
    allViolations.push(...this.detectDuplicateAssistants(teams));
    allViolations.push(...this.detectIllegalSignings(teams, transfers));
    allViolations.push(...this.detectCupTiedViolations(teams, guild, settings));
    allViolations.push(...this.detectTransferWindowViolations(transfers, transferWindowOpen));
    allViolations.push(...this.detectMissingManagers(teams));
    allViolations.push(...this.detectMissingAssistants(teams));
    allViolations.push(...this.detectRosterViolations(teams));

    // Update violations, keeping critical ones and removing resolved ones
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Keep critical violations that haven't been resolved
    this.violations = this.violations.filter((v) => {
      const violationDate = new Date(v.timestamp);
      // Keep if it's recent and critical
      return v.severity === 'CRITICAL' && violationDate > twentyFourHoursAgo;
    });

    // Add new violations
    for (const violation of allViolations) {
      const exists = this.violations.some(
        (v) => v.type === violation.type && JSON.stringify(v) === JSON.stringify(violation)
      );
      if (!exists) {
        this.violations.push(violation);
      }
    }

    // Generate warnings
    this.warnings = allViolations.map((v) => ({
      ...v,
      id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'ACTIVE',
      resolvedAt: null,
    }));

    this.lastScan = new Date().toISOString();
    await this.sync();

    return {
      totalViolations: this.violations.length,
      newWarnings: this.warnings.length,
      violations: this.violations,
      warnings: this.warnings,
    };
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GETTERS & RESOLVERS
  // ════════════════════════════════════════════════════════════════════════════════

  getViolationsBySeverity(severity) {
    return this.violations.filter((v) => v.severity === severity);
  }

  getViolationsByType(type) {
    return this.violations.filter((v) => v.type === type);
  }

  getActiveWarnings() {
    return this.warnings.filter((w) => w.status === 'ACTIVE');
  }

  getWarningsByType(type) {
    return this.warnings.filter((w) => w.type === type);
  }

  async resolveWarning(warningId) {
    const warning = this.warnings.find((w) => w.id === warningId);
    if (warning) {
      warning.status = 'RESOLVED';
      warning.resolvedAt = new Date().toISOString();
      await this.sync();
      return warning;
    }
    return null;
  }

  async clearOldWarnings(olderThanDays = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const beforeCount = this.warnings.length;
    this.warnings = this.warnings.filter((w) => {
      const warningDate = new Date(w.timestamp);
      return warningDate > cutoffDate || w.status === 'ACTIVE';
    });

    const clearedCount = beforeCount - this.warnings.length;
    await this.sync();
    return clearedCount;
  }

  getSummary() {
    const summary = {
      totalViolations: this.violations.length,
      critical: this.violations.filter((v) => v.severity === 'CRITICAL').length,
      high: this.violations.filter((v) => v.severity === 'HIGH').length,
      medium: this.violations.filter((v) => v.severity === 'MEDIUM').length,
      low: this.violations.filter((v) => v.severity === 'LOW').length,
      activeWarnings: this.warnings.filter((w) => w.status === 'ACTIVE').length,
      lastScan: this.lastScan,
      violationsByType: {},
    };

    for (const violation of this.violations) {
      if (!summary.violationsByType[violation.type]) {
        summary.violationsByType[violation.type] = 0;
      }
      summary.violationsByType[violation.type]++;
    }

    return summary;
  }
}

module.exports = ComplianceEngine;
