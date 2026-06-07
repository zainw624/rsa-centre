const { SlashCommandBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { addTransaction, createTransactionId } = require('../utils/transactions');
const { buildSanctionEmbed } = require('../utils/embeds');
const { memberHasRoleNames } = require('../utils/permissions');
const { addActivityEvent } = require('../utils/dashboardStorage');

const SANCTION_CHOICES = [
  { name: 'Sanctioned', value: 'Sanctioned' },
  { name: 'Cup Tied', value: 'Cup Tied' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sanction')
    .setDescription('Apply a sanction to a player')
    .addUserOption((option) => option.setName('player').setDescription('The player to sanction').setRequired(true))
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('The type of sanction')
        .setRequired(true)
        .addChoices(...SANCTION_CHOICES)
    )
    .addStringOption((option) => option.setName('reason').setDescription('Reason for the sanction').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const settings = await loadSettings();
    const commandChannelId = interaction.channelId;

    if (commandChannelId !== settings.botCommandsChannelId) {
      await interaction.editReply({ content: '❌ This command can only be used in the designated bot commands channel.' });
      return;
    }

    if (!memberHasRoleNames(interaction.member, settings.sanctionRoleNames)) {
      await interaction.editReply({ content: '❌ You do not have permission to use this command.' });
      return;
    }

    const targetUser = interaction.options.getUser('player', true);
    const sanctionType = interaction.options.getString('type', true);
    const reason = interaction.options.getString('reason', true).trim();
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      await interaction.editReply({ content: '❌ Unable to locate that player in the server.' });
      return;
    }

    const roleId = sanctionType === 'Cup Tied' ? settings.cupTiedRoleId : settings.sanctionedRoleId;
    const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
    if (!role) {
      await interaction.editReply({ content: '❌ Sanction role not found on this server.' });
      return;
    }

    if (targetMember.roles.cache.has(role.id)) {
      await interaction.editReply({ content: `❌ This player already has the ${sanctionType} role.` });
      return;
    }

    try {
      await targetMember.roles.add(role);
    } catch (error) {
      await interaction.editReply({ content: `❌ Failed to apply the sanction role: ${error.message}` });
      return;
    }

    const transactionId = createTransactionId();
    const transaction = {
      id: transactionId,
      type: 'sanction',
      sanctionType,
      status: 'active',
      playerId: targetMember.id,
      playerTag: targetMember.user.tag,
      roleId: role.id,
      teamCode: null,
      teamName: null,
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
      reason,
      timestamp: new Date().toISOString(),
    };
    await addTransaction(transaction);

    const embed = buildSanctionEmbed(`<@${targetMember.id}>`, transactionId, sanctionType, reason);
    const contractsChannel = await interaction.client.channels.fetch(settings.contractsChannelId).catch(() => null);
    if (contractsChannel && contractsChannel.isTextBased()) {
      await contractsChannel.send({ embeds: [embed] }).catch(() => null);
    }

    await addActivityEvent({
      emoji: sanctionType === 'Cup Tied' ? '⛔' : '⚠️',
      text: `${targetMember.user.tag} received ${sanctionType}`,
      type: 'sanctionApplied',
      sanctionType,
      playerId: targetMember.id,
      staffId: interaction.user.id,
      guildId: interaction.guild.id,
    }).catch(() => null);

    await interaction.editReply({ content: `✅ ${targetMember.user.tag} has been marked as ${sanctionType}.` });
  },
};
