const { getTeamByRoleId } = require('../utils/teams');
const { loadSettings } = require('../utils/settings');
const { addTransaction, createTransactionId } = require('../utils/transactions');
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

      // Manually assigning a national team role is NOT treated as an illegal
      // signing on its own. Only flag when there is clear evidence of a real
      // rule breach — the player is Cup Tied or under an active sanction.
      const isCupTied = settings.cupTiedRoleId && newMember.roles.cache.has(settings.cupTiedRoleId);
      const isSanctioned = settings.sanctionedRoleId && newMember.roles.cache.has(settings.sanctionedRoleId);
      if (!isCupTied && !isSanctioned) continue;

      const issueParts = [];
      if (isCupTied) issueParts.push('Player is Cup Tied and is ineligible to sign for another national team.');
      if (isSanctioned) issueParts.push('Player is sanctioned and cannot be signed while the sanction is active.');

      const transactionId = createTransactionId();
      await addTransaction({
        id: transactionId,
        type: 'illegal',
        status: 'flagged',
        playerId: newMember.id,
        playerTag: newMember.user.tag,
        teamCode: team.teamCode,
        teamName: team.teamName,
        staffId: null,
        reason: issueParts.join(' '),
        timestamp: new Date().toISOString(),
      });

      const embed = buildIllegalSigningEmbed(`<@${newMember.id}>`, team.teamName, issueParts.join(' '), transactionId);
      if (contractsChannel && contractsChannel.isTextBased()) {
        await contractsChannel.send({ embeds: [embed] }).catch(() => null);
      }
    }
  },
};
