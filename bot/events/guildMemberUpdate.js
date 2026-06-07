const { getTeamByRoleId } = require('../utils/teams');
const { loadSettings } = require('../utils/settings');
const { findSignTransactionForPlayer, addTransaction, createTransactionId } = require('../utils/transactions');
const { buildIllegalSigningEmbed } = require('../utils/embeds');
const ManagerManager = require('../services/ManagerManager');
const AssistantManager = require('../services/AssistantManager');

const managerManager = new ManagerManager();
const assistantManager = new AssistantManager();

module.exports = {
  name: 'guildMemberUpdate',
  once: false,
  async execute(oldMember, newMember) {
    if (!oldMember || !newMember || oldMember.guild.id !== newMember.guild.id) return;

    const oldRoleIds = new Set(oldMember.roles.cache.map((role) => role.id));
    const newRoleIds = new Set(newMember.roles.cache.map((role) => role.id));
    const addedRoleIds = [...newRoleIds].filter((id) => !oldRoleIds.has(id));
    const removedRoleIds = [...oldRoleIds].filter((id) => !newRoleIds.has(id));

    if (addedRoleIds.length > 0 || removedRoleIds.length > 0) {
      await Promise.all([
        managerManager.initialize(),
        assistantManager.initialize(),
      ]);

      await Promise.all([
        managerManager.handleMemberRoleChange(oldMember, newMember).catch((error) => {
          console.warn('⚠️ Failed to update manager leadership after role change:', error.message);
        }),
        assistantManager.handleMemberRoleChange(oldMember, newMember).catch((error) => {
          console.warn('⚠️ Failed to update assistant leadership after role change:', error.message);
        }),
      ]);
    }

    if (!addedRoleIds.length) return;

    const settings = await loadSettings();
    const contractsChannel = await newMember.guild.channels.fetch(settings.contractsChannelId).catch(() => null);

    for (const roleId of addedRoleIds) {
      const team = await getTeamByRoleId(roleId, newMember.guild);
      if (!team) continue;

      // Debounce briefly to allow sign flows to complete and transactions to be recorded
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Re-fetch team to get up-to-date roster
      const freshTeam = await getTeamByRoleId(roleId, newMember.guild);
      const transaction = await findSignTransactionForPlayer(newMember.id, freshTeam?.teamCode || team.teamCode);
      const rostered = Array.isArray(freshTeam?.rosterPlayers) ? freshTeam.rosterPlayers.some((entry) => entry.playerId === newMember.id) : false;
      const validTransaction = transaction && ['pending', 'accepted', 'completed'].includes(transaction.status) && transaction.transferWindowOpen === true;
      if (validTransaction && rostered) continue;

      const issueParts = [];
      if (!transaction) issueParts.push('No valid signing transaction found.');
      if (transaction && transaction.transferWindowOpen !== true) issueParts.push('Transfer window was not marked open.');
      if (!rostered) issueParts.push('Player is not listed on the team roster.');

      const transactionId = createTransactionId();
      await addTransaction({
        id: transactionId,
        type: 'illegal',
        status: 'flagged',
        playerId: newMember.id,
        playerTag: newMember.user.tag,
        teamCode: freshTeam?.teamCode || team.teamCode,
        teamName: freshTeam?.teamName || team.teamName,
        staffId: null,
        reason: issueParts.join(' '),
        timestamp: new Date().toISOString(),
      });

      const embed = buildIllegalSigningEmbed(`<@${newMember.id}>`, freshTeam?.teamName || team.teamName, issueParts.join(' '), transactionId);
      if (contractsChannel && contractsChannel.isTextBased()) {
        await contractsChannel.send({ embeds: [embed] }).catch(() => null);
      }
    }
  },
};
