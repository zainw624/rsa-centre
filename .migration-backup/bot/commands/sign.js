const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { loadTransferWindow } = require('../utils/transferWindow');
const { loadTeams, saveTeams, getTeamByName, getTeamForMember, addPlayerToRoster, removePlayerFromRoster, resolveTeamRole, syncRostersFromGuildRoles } = require('../utils/teams');
const { createTransactionId, loadTransactions, saveTransactions, getTransactionById, addTransaction } = require('../utils/transactions');
const { buildSigningEmbed } = require('../utils/embeds');
const { memberHasRoleNames } = require('../utils/permissions');
const { getProcessedLogoAttachment } = require('../utils/logo');
const {
  addRosterPlayer: dbAddRosterPlayer,
  removeRosterPlayer: dbRemoveRosterPlayer,
  createTransfer: dbCreateTransfer,
  updateTransferStatus: dbUpdateTransferStatus,
  createActivityLog: dbCreateActivityLog,
  createAuditLog: dbCreateAuditLog,
  upsertTeam: dbUpsertTeam,
} = require('../utils/database');

const AUTO_ACCEPT_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours
const pendingTimeouts = new Map();
const SIGN_BUTTON_PREFIX = 'rsa-sign';

async function getGuildMember(interaction, userId) {
  return interaction.guild.members.fetch(userId).catch(() => null);
}

async function createButtonRow(transactionId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`${SIGN_BUTTON_PREFIX}-accept-${transactionId}`).setLabel('Accept').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`${SIGN_BUTTON_PREFIX}-decline-${transactionId}`).setLabel('Decline').setStyle(ButtonStyle.Danger)
  );
}

async function runAutoAccept(client, transactionId) {
  const transactions = await loadTransactions();
  const transaction = transactions.find((entry) => entry.id === transactionId);
  if (!transaction || transaction.status !== 'pending') return;

  transaction.status = 'accepted';
  await saveTransactions(transactions);
  pendingTimeouts.delete(transactionId);

  if (client.leagueMonitor?.transferManager?.addTransfer) {
    await recordTransfer(client, {
      playerId: transaction.playerId,
      playerTag: transaction.playerTag,
      fromTeam: 'Free Agent',
      toTeam: transaction.teamName,
      transactionId: transaction.id,
      type: 'sign',
      status: 'completed',
      completedAt: new Date().toISOString(),
      guildId: transaction.guildId,
      staffId: transaction.staffId,
      timestamp: new Date().toISOString(),
    }).catch(() => null);
  }

  const settings = await loadSettings();
  const contractsChannel = await client.channels.fetch(settings.contractsChannelId).catch(() => null);
  if (contractsChannel && contractsChannel.isTextBased()) {
    const originalSigning = await contractsChannel.messages.fetch(transaction.contractMessageId).catch(() => null);
    if (originalSigning) {
      await originalSigning.edit({ content: '⏰ Contract confirmation window expired. The signing is now accepted.', components: [] }).catch(() => null);
    }
  }

  const user = await client.users.fetch(transaction.playerId).catch(() => null);
  if (!user) return;

  const dmChannel = await user.createDM().catch(() => null);
  if (!dmChannel) return;

  const dmMessage = await dmChannel.messages.fetch(transaction.dmMessageId).catch(() => null);
  if (!dmMessage) return;

  await dmMessage.edit({
    content: '⏰ Contract confirmation period expired. The signing is now considered accepted.',
    embeds: [],
    components: [],
  }).catch(() => null);
}

async function recordTransfer(client, transfer) {
  if (!client?.leagueMonitor?.transferManager?.addTransfer) return null;
  return client.leagueMonitor.transferManager.addTransfer(transfer);
}

async function cleanupFailedSigning(member, teamRole, freeAgentRole, teamName) {
  await removePlayerFromRoster(teamName, member.id).catch(() => null);
  if (teamRole && member.roles.cache.has(teamRole.id)) {
    await member.roles.remove(teamRole).catch(() => null);
  }
  if (freeAgentRole && !member.roles.cache.has(freeAgentRole.id)) {
    await member.roles.add(freeAgentRole).catch(() => null);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sign')
    .setDescription('Sign a player to a national team roster')
    .addUserOption((option) => option.setName('player').setDescription('The player to sign').setRequired(true))
    .addStringOption((option) =>
      option
        .setName('team')
        .setDescription('Select the national team')
        .setRequired(true)
        .addChoices(...require('../data/teams.json').teams.map((team) => ({ name: team.teamName, value: team.teamName })))
    ),

  async execute(interaction) {
    const settings = await loadSettings();
    try {
      await interaction.deferReply({ flags: 64 });
    } catch (e) {
      // ignore defer errors
    }
    if (interaction.channelId !== settings.botCommandsChannelId) {
      await interaction.editReply({ content: '❌ This command can only be used in the designated bot commands channel.' });
      return;
    }

    if (!memberHasRoleNames(interaction.member, settings.managerRoleNames)) {
      await interaction.editReply({ content: '❌ You do not have permission to use this command.' });
      return;
    }

    const targetUser = interaction.options.getUser('player', true);
    const teamName = interaction.options.getString('team', true);
    await syncRostersFromGuildRoles(interaction.guild).catch(() => null);
    const targetMember = await getGuildMember(interaction, targetUser.id);
    if (!targetMember) {
      await interaction.editReply({ content: '❌ Unable to locate that player in the server.' });
      return;
    }

    if (settings.worldCupMode) {
      await interaction.editReply({ content: '❌ The World Cup roster lock is active.' });
      return;
    }

    const transferWindowOpen = await loadTransferWindow();
    if (!transferWindowOpen) {
      const blockedTransaction = {
        id: createTransactionId(),
        type: 'transfer_blocked',
        action: 'sign',
        status: 'blocked',
        playerId: targetMember.id,
        playerTag: targetMember.user.tag,
        teamName,
        guildId: interaction.guild.id,
        staffId: interaction.user.id,
        reason: 'Transfer window closed',
        timestamp: new Date().toISOString(),
      };
      await addTransaction(blockedTransaction).catch(() => null);
      await interaction.editReply({ content: '❌ The transfer window is currently closed. Signings are blocked.' });
      return;
    }

    if (targetMember.roles.cache.has(settings.cupTiedRoleId)) {
      await interaction.editReply({ content: '❌ This player is Cup Tied and is not eligible to sign for another national team.' });
      return;
    }

    if (targetMember.roles.cache.has(settings.sanctionedRoleId)) {
      await interaction.editReply({ content: '❌ This player is sanctioned and cannot be signed while the sanction is active.' });
      return;
    }

    const freeAgentRole = interaction.guild.roles.cache.find((role) => role.name === settings.freeAgentRoleName);
    if (!freeAgentRole || !targetMember.roles.cache.has(freeAgentRole.id)) {
      await interaction.editReply({ content: '❌ The player must have the Free Agent role before signing.' });
      return;
    }

    const team = await getTeamByName(teamName);
    if (!team) {
      await interaction.editReply({ content: '❌ Team not found in teams.json.' });
      return;
    }

    const dbTeam = await dbUpsertTeam({
      teamId: team.teamId,
      teamName: team.teamName,
      teamCode: team.teamCode,
      logo: team.logo,
      roleId: team.roleId,
      coachDiscordId: interaction.user.id,
      rosterLimit: team.rosterLimit,
    });

    const existingTeamRole = await getTeamForMember(targetMember);
    if (existingTeamRole) {
      if (existingTeamRole.teamName === team.teamName) {
        await interaction.editReply({ content: '❌ The player is already signed to that national team.' });
      } else {
        await interaction.editReply({ content: '❌ The player already belongs to another national team.' });
      }
      return;
    }

    if (team.rosterPlayers.length >= team.rosterLimit) {
      await interaction.editReply({ content: `❌ ${team.teamName} roster is full (${team.rosterLimit}/16).` });
      return;
    }

    const teamRole = resolveTeamRole(interaction.guild, team);
    if (!teamRole) {
      await interaction.editReply({ content: `❌ Team role for ${team.teamName} is missing from this server. Please create the role or update teams.json roleId values.` });
      return;
    }

    let logoAttachment;
    try {
      logoAttachment = await getProcessedLogoAttachment(team);
    } catch (error) {
      await interaction.editReply({ content: `❌ Team logo file could not be loaded or processed: ${error.message}` });
      return;
    }

    let updatedTeam;
    try {
      updatedTeam = await addPlayerToRoster(team.teamName, targetMember.id, targetMember.user.tag);
      updatedTeam.coachDiscordId = interaction.user.id;
      const teams = await loadTeams();
      const persistedTeam = teams.find((entry) => entry.teamName === updatedTeam.teamName);
      if (persistedTeam) {
        persistedTeam.coachDiscordId = interaction.user.id;
        await saveTeams(teams);
      }

      await dbAddRosterPlayer({
        teamId: dbTeam.id,
        playerId: targetMember.id,
        playerTag: targetMember.user.tag,
      });
    } catch (error) {
      await interaction.editReply({ content: `❌ Unable to add the player to the roster: ${error.message}` });
      return;
    }

    try {
      await targetMember.roles.remove(freeAgentRole);
      await targetMember.roles.add(teamRole);
    } catch (error) {
      await cleanupFailedSigning(targetMember, teamRole, freeAgentRole, team.teamName);
      await interaction.editReply({ content: `❌ Failed to update player roles: ${error.message}` });
      return;
    }

    const transactionId = createTransactionId();
    const embed = buildSigningEmbed(updatedTeam, `<@${targetMember.id}>`, transactionId);
    embed.setThumbnail(`attachment://${logoAttachment.name}`);

    const buttonRow = await createButtonRow(transactionId);
    const contractsChannel = await interaction.client.channels.fetch(settings.contractsChannelId).catch(() => null);
    if (!contractsChannel || !contractsChannel.isTextBased()) {
      await cleanupFailedSigning(targetMember, teamRole, freeAgentRole, team.teamName);
      await interaction.editReply({ content: '❌ Contracts channel is not available or is not a text channel.' });
      return;
    }

    let contractMessage;
    let dmMessage;
    try {
      contractMessage = await contractsChannel.send({ embeds: [embed], files: [logoAttachment], allowedMentions: { parse: ['users'], roles: [] } });
      const dmChannel = await targetMember.user.createDM();
      dmMessage = await dmChannel.send({ embeds: [embed], files: [logoAttachment], components: [buttonRow], allowedMentions: { parse: ['users'], roles: [] } });
    } catch (error) {
      await cleanupFailedSigning(targetMember, teamRole, freeAgentRole, team.teamName);
      if (contractMessage) await contractMessage.delete().catch(() => null);
      await interaction.editReply({ content: `❌ Failed to send the signing notification: ${error.message}` });
      return;
    }

    const transactions = await loadTransactions();
    transactions.push({
      id: transactionId,
      type: 'sign',
      status: 'pending',
      playerId: targetMember.id,
      playerTag: targetMember.user.tag,
      teamCode: team.teamCode,
      teamName: team.teamName,
      coachDiscordId: updatedTeam.coachDiscordId,
      contractMessageId: contractMessage.id,
      dmMessageId: dmMessage.id,
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
      transferWindowOpen: true,
      timestamp: new Date().toISOString(),
    });
    await saveTransactions(transactions);

    await dbCreateTransfer({
      transactionId,
      type: 'sign',
      status: 'pending',
      action: 'sign',
      playerId: targetMember.id,
      playerTag: targetMember.user.tag,
      fromTeam: 'Free Agent',
      toTeam: team.teamName,
      teamId: dbTeam.id,
      sourceCommand: 'sign',
      reason: 'Signing initiated via sign command',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
    });

    await dbCreateAuditLog({
      actionType: 'sign_initiated',
      sourceCommand: 'sign',
      userId: interaction.user.id,
      targetPlayerId: targetMember.id,
      targetTeamId: dbTeam.id,
      details: `Player ${targetMember.user.tag} signing initiated for ${team.teamName}`,
    });

    pendingTimeouts.set(transactionId, setTimeout(() => runAutoAccept(interaction.client, transactionId), AUTO_ACCEPT_TIMEOUT_MS));
    await interaction.editReply({ content: `✅ Signing processed for ${targetMember.user.tag}. A contract has been posted to the contracts channel.` });
  },

  async handleButtonInteraction(interaction) {
    const CUSTOM_ID_PREFIX = 'rsa-sign-';
    if (!interaction.customId.startsWith(CUSTOM_ID_PREFIX)) return;

    const payload = interaction.customId.slice(CUSTOM_ID_PREFIX.length);
    const splitIndex = payload.indexOf('-');
    if (splitIndex === -1) {
      await interaction.reply({ content: '❌ Invalid sign button interaction.', flags: 64 });
      return;
    }

    const action = payload.slice(0, splitIndex);
    const transactionId = payload.slice(splitIndex + 1);
    if (!transactionId) {
      await interaction.reply({ content: '❌ Invalid signing transaction identifier.', flags: 64 });
      return;
    }

    const transactions = await loadTransactions();
    const transaction = transactions.find((entry) => entry.id === transactionId);
    if (!transaction || transaction.type !== 'sign') {
      console.warn('Button interaction could not find transaction:', transactionId);
      await interaction.reply({ content: '❌ Unable to locate the signing transaction.', flags: 64 });
      return;
    }

    if (interaction.user.id !== transaction.playerId) {
      await interaction.reply({ content: '❌ Only the signed player may use this button.', flags: 64 });
      return;
    }

    if (transaction.status !== 'pending') {
      await interaction.reply({ content: '❌ This contract has already been processed.', flags: 64 });
      return;
    }

    const team = await getTeamByName(transaction.teamName);
    if (!team) {
      await interaction.reply({ content: '❌ Team information could not be loaded.', flags: 64 });
      return;
    }

    const dbTeam = await dbUpsertTeam({
      teamId: team.teamId,
      teamName: team.teamName,
      teamCode: team.teamCode,
      logo: team.logo,
      roleId: team.roleId,
      coachDiscordId: transaction.staffId,
      rosterLimit: team.rosterLimit,
    });

    const guild = await interaction.client.guilds.fetch(transaction.guildId).catch(() => null);
    if (!guild) {
      await interaction.reply({ content: '❌ Unable to access the guild that initiated the contract.', flags: 64 });
      return;
    }

    const targetMember = await guild.members.fetch(transaction.playerId).catch(() => null);
    if (!targetMember) {
      await interaction.reply({ content: '❌ Unable to locate the player in the server.', flags: 64 });
      return;
    }

    if (action === 'accept') {
      const settings = await loadSettings();
      const teamRole = guild.roles.cache.get(team.roleId);
      if (!teamRole) {
        await interaction.reply({ content: `❌ Team role for ${team.teamName} could not be found. Please contact an administrator.`, flags: 64 });
        return;
      }

      try {
        if (!targetMember.roles.cache.has(teamRole.id)) {
          await targetMember.roles.add(teamRole);
        }
      } catch (error) {
        await interaction.reply({ content: `❌ Failed to assign team role: ${error.message}`, flags: 64 });
        return;
      }

      try {
        transaction.status = 'accepted';
        await saveTransactions(transactions);
        await dbUpdateTransferStatus(transactionId, 'accepted');
        await dbCreateAuditLog({
          actionType: 'sign_accepted',
          sourceCommand: 'sign',
          userId: interaction.user.id,
          targetPlayerId: transaction.playerId,
          targetTeamId: dbTeam.id,
          details: `Player ${transaction.playerTag} accepted signing with ${team.teamName}`,
        });
      } catch (error) {
        console.error('Failed to save transaction on accept:', error);
        await interaction.reply({ content: `❌ Failed to save transaction: ${error.message}`, flags: 64 });
        return;
      }

      if (interaction.client.leagueMonitor?.transferManager?.addTransfer) {
        await recordTransfer(interaction.client, {
          playerId: transaction.playerId,
          playerTag: transaction.playerTag,
          fromTeam: 'Free Agent',
          toTeam: team.teamName,
          transactionId: transaction.id,
          type: 'sign',
          status: 'completed',
          completedAt: new Date().toISOString(),
          guildId: guild.id,
          staffId: transaction.staffId,
          timestamp: new Date().toISOString(),
        }).catch((error) => {
          console.error('Failed to record accepted signing transfer:', error);
        });
      }

      const timeout = pendingTimeouts.get(transactionId);
      if (timeout) {
        clearTimeout(timeout);
        pendingTimeouts.delete(transactionId);
      }

      const contractsChannel = await interaction.client.channels.fetch(settings.contractsChannelId).catch(() => null);
      if (contractsChannel && contractsChannel.isTextBased()) {
        const originalSigning = await contractsChannel.messages.fetch(transaction.contractMessageId).catch(() => null);
        if (originalSigning) {
          await originalSigning.edit({ content: '✅ Contract accepted by the player.', components: [] }).catch(() => null);
        }
      }

      await interaction.update({ content: `✅ You have accepted this contract and are now officially registered with ${team.teamName}.`, embeds: [], components: [] });
      return;
    }

    if (action === 'decline') {
      const settings = await loadSettings();
      const freeAgentRole = guild.roles.cache.find((role) => role.name === settings.freeAgentRoleName);
      const teamRole = guild.roles.cache.get(team.roleId);
      
      try {
        if (teamRole && targetMember.roles.cache.has(teamRole.id)) {
          await targetMember.roles.remove(teamRole).catch(() => null);
        }
        if (freeAgentRole && !targetMember.roles.cache.has(freeAgentRole.id)) {
          await targetMember.roles.add(freeAgentRole).catch(() => null);
        }
        await removePlayerFromRoster(team.teamName, targetMember.id).catch(() => null);
      } catch (error) {
        console.error('Error during decline role cleanup:', error);
      }

      try {
        transaction.status = 'declined';
        await saveTransactions(transactions);
        await dbUpdateTransferStatus(transactionId, 'declined');
        await dbRemoveRosterPlayer({ teamId: dbTeam.id, playerId: targetMember.id });
        await dbCreateAuditLog({
          actionType: 'sign_declined',
          sourceCommand: 'sign',
          userId: interaction.user.id,
          targetPlayerId: transaction.playerId,
          targetTeamId: dbTeam.id,
          details: `Player ${transaction.playerTag} declined signing with ${team.teamName}`,
        });
      } catch (error) {
        console.error('Failed to save declined transaction:', error);
        await interaction.reply({ content: `❌ Failed to save transaction: ${error.message}`, flags: 64 });
        return;
      }

      const timeout = pendingTimeouts.get(transactionId);
      if (timeout) {
        clearTimeout(timeout);
        pendingTimeouts.delete(transactionId);
      }

      const contractsChannel = await interaction.client.channels.fetch((await loadSettings()).contractsChannelId).catch(() => null);
      if (contractsChannel && contractsChannel.isTextBased()) {
        const originalSigning = await contractsChannel.messages.fetch(transaction.contractMessageId).catch(() => null);
        if (originalSigning) {
          await originalSigning.delete().catch(() => null);
        }
        const declineEmbed = new (require('discord.js').EmbedBuilder)()
          .setTitle('❌ Contract Declined')
          .setDescription('The player has declined the national team contract.')
          .setColor('#ED4245')
          .addFields(
            { name: 'Player', value: `<@${transaction.playerId}>`, inline: false },
            { name: 'Team', value: transaction.teamName, inline: true },
            { name: 'Transaction ID', value: transaction.id, inline: true }
          )
          .setTimestamp();
        await contractsChannel.send({ embeds: [declineEmbed], allowedMentions: { parse: ['users'], roles: [] } }).catch(() => null);
      }

      await interaction.update({ content: '❌ You have declined the contract. Your signing has been canceled.', embeds: [], components: [] });
      return;
    }

    await interaction.reply({ content: '❌ Unrecognized button action.', flags: 64 });
  },
};
