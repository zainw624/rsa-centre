const { SlashCommandBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { loadTransferWindow } = require('../utils/transferWindow');
const { getTeamForMember, removePlayerFromRoster, resolveTeamRole } = require('../utils/teams');
const { createTransactionId, addTransaction } = require('../utils/transactions');
const { buildReleaseEmbed } = require('../utils/embeds');
const { memberHasRoleNames } = require('../utils/permissions');
const { getProcessedLogoAttachment } = require('../utils/logo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Release a player from their current national team roster')
    .addUserOption((option) => option.setName('player').setDescription('The player to release').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for release')),

  async execute(interaction) {
    const settings = await loadSettings();
    await require('../utils/teams').syncRostersFromGuildRoles(interaction.guild).catch(() => null);
    if (!memberHasRoleNames(interaction.member, settings.managerRoleNames)) {
      await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: 64 });
      return;
    }

    if (settings.worldCupMode && !memberHasRoleNames(interaction.member, settings.worldCupLockRoleNames)) {
      await interaction.reply({ content: '❌ World Cup roster protection is active. Only RSA leadership may release players during World Cup Mode.', flags: 64 });
      return;
    }

    const transferWindowOpen = await loadTransferWindow();
    if (!transferWindowOpen) {
      const targetUser = interaction.options.getUser('player', true);
      const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
      await addTransaction({
        id: createTransactionId(),
        type: 'transfer_blocked',
        action: 'release',
        status: 'blocked',
        playerId: targetMember?.id || null,
        playerTag: targetMember?.user.tag || targetUser.username,
        guildId: interaction.guild.id,
        staffId: interaction.user.id,
        reason: 'Transfer window closed',
        timestamp: new Date().toISOString(),
      }).catch(() => null);
      await interaction.reply({ content: '❌ The transfer window is currently closed. Releases are blocked.', flags: 64 });
      return;
    }

    const targetUser = interaction.options.getUser('player', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      await interaction.reply({ content: '❌ Unable to locate that player in the server.', flags: 64 });
      return;
    }

    const team = await getTeamForMember(targetMember);
    if (!team) {
      await interaction.reply({ content: '❌ That player is not assigned to a national team.', flags: 64 });
      return;
    }

    const teamRole = resolveTeamRole(interaction.guild, team);
    const freeAgentRole = interaction.guild.roles.cache.find((role) => role.name === settings.freeAgentRoleName);
    if (!freeAgentRole) {
      await interaction.reply({ content: '❌ Free Agent role not found in this server.', flags: 64 });
      return;
    }

    let updatedTeam;
    let logoAttachment = null;
    try {
      logoAttachment = await getProcessedLogoAttachment(team);
    } catch {
      logoAttachment = null;
    }
    let rosterWasOutOfSync = false;
    try {
      updatedTeam = await removePlayerFromRoster(team.teamName, targetMember.id);
    } catch (error) {
      if (error.message.includes('Player not found on')) {
        rosterWasOutOfSync = true;
        updatedTeam = team;
      } else {
        await interaction.reply({ content: `❌ Unable to remove the player from the roster: ${error.message}`, flags: 64 });
        return;
      }
    }

    if (teamRole && targetMember.roles.cache.has(teamRole.id)) {
      await targetMember.roles.remove(teamRole).catch(() => null);
    }
    if (!targetMember.roles.cache.has(freeAgentRole.id)) {
      await targetMember.roles.add(freeAgentRole).catch(() => null);
    }

    const transactionId = createTransactionId();
    const embed = buildReleaseEmbed(updatedTeam, `<@${targetMember.id}>`, transactionId, reason);
    if (logoAttachment) {
      embed.setThumbnail(`attachment://${logoAttachment.name}`);
    }

    const transaction = {
      id: transactionId,
      type: 'release',
      status: 'completed',
      playerId: targetMember.id,
      playerTag: targetMember.user.tag,
      teamCode: updatedTeam.teamCode,
      teamName: updatedTeam.teamName,
      coachDiscordId: updatedTeam.coachDiscordId,
      reason,
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
      timestamp: new Date().toISOString(),
    };

    await addTransaction(transaction);

    if (interaction.client.leagueMonitor?.transferManager?.addTransfer) {
      await interaction.client.leagueMonitor.transferManager.addTransfer({
        playerId: targetMember.id,
        playerTag: targetMember.user.tag,
        fromTeam: updatedTeam.teamName,
        toTeam: 'Free Agent',
        transactionId,
        type: 'release',
        guildId: interaction.guild.id,
        staffId: interaction.user.id,
        timestamp: new Date().toISOString(),
      }).catch((error) => {
        console.error('Failed to record release transfer:', error);
      });
    }

    const releaseChannel = await interaction.client.channels.fetch(settings.releaseChannelId).catch(() => null);
    if (releaseChannel && releaseChannel.isTextBased()) {
      const sendPayload = { embeds: [embed], allowedMentions: { parse: [], roles: [] } };
      if (logoAttachment) {
        sendPayload.files = [logoAttachment];
      }
      await releaseChannel.send(sendPayload).catch(() => null);
    }

    const replyPayload = { content: `✅ ${targetMember.user.tag} has been released from ${updatedTeam.teamName}.`, embeds: [embed], flags: 64, allowedMentions: { parse: ['users'], roles: [] } };
    if (logoAttachment) {
      replyPayload.files = [logoAttachment];
    }
    await interaction.reply(replyPayload);
  },
};
