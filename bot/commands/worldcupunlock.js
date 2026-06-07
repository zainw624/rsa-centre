const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadSettings, updateSettings } = require('../utils/settings');
const { memberHasRoleNames } = require('../utils/permissions');
const { addTransaction, createTransactionId } = require('../utils/transactions');
const { addActivityEvent } = require('../utils/dashboardStorage');
const { scheduleDashboardUpdate } = require('../events/dashboardAutoUpdate');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('worldcupunlock')
    .setDescription('Disable World Cup roster lock and return the RSA system to normal roster management'),

  async execute(interaction) {
    const settings = await loadSettings();
    if (!memberHasRoleNames(interaction.member, settings.worldCupUnlockRoleNames)) {
      await interaction.reply({ content: '❌ You do not have permission to use /worldcupunlock.', flags: 64 });
      return;
    }

    if (!settings.worldCupMode) {
      await interaction.reply({ content: '❌ World Cup Mode is not currently enabled.', flags: 64 });
      return;
    }

    await updateSettings({ worldCupMode: false });
    await scheduleDashboardUpdate(interaction.guild).catch(() => null);
    await addTransaction({
      id: createTransactionId(),
      type: 'worldcup',
      action: 'unlock',
      status: 'inactive',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
      reason: 'World Cup roster lock disabled',
      timestamp: new Date().toISOString(),
    }).catch(() => null);
    await addActivityEvent({
      emoji: '🔓',
      text: 'World Cup Mode disabled',
      type: 'worldCupUnlock',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
    }).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle('🔓 World Cup Mode Disabled')
      .setDescription('The RSA World Cup roster lock has been removed.')
      .setColor('#00B37E')
      .addFields(
        { name: '🔓 Transfer System', value: 'Available', inline: true },
        { name: '📋 Auditing', value: 'Normal Mode', inline: true },
        { name: '👤 Disabled By', value: `<@${interaction.user.id}>`, inline: true }
      )
      .setFooter({ text: 'RSA | Roblox Soccer Association' })
      .setTimestamp();

    const contractsChannel = await interaction.client.channels.fetch(settings.contractsChannelId).catch(() => null);
    if (contractsChannel && contractsChannel.isTextBased()) {
      await contractsChannel.send({ embeds: [embed] }).catch(() => null);
    }

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
