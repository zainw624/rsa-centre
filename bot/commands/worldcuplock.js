const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadSettings, updateSettings } = require('../utils/settings');
const { createSnapshot } = require('../utils/snapshot');
const { runAdvancedAudit } = require('../utils/audit');
const { memberHasRoleNames } = require('../utils/permissions');
const { addTransaction, createTransactionId } = require('../utils/transactions');
const { addActivityEvent } = require('../utils/dashboardStorage');
const { scheduleDashboardUpdate } = require('../events/dashboardAutoUpdate');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('worldcuplock')
    .setDescription('Activate World Cup roster lock, create an official system snapshot, and enforce strict protections'),

  async execute(interaction) {
    const settings = await loadSettings();
    if (!memberHasRoleNames(interaction.member, settings.worldCupLockRoleNames)) {
      await interaction.reply({ content: '❌ You do not have permission to use /worldcuplock.', flags: 64 });
      return;
    }

    if (settings.worldCupMode) {
      await interaction.reply({ content: '❌ World Cup Mode is already enabled.', flags: 64 });
      return;
    }

    await updateSettings({ worldCupMode: true, transferWindowOpen: false });
    await scheduleDashboardUpdate(interaction.guild).catch(() => null);
    const snapshot = await createSnapshot('worldcup');
    const audit = await runAdvancedAudit(interaction.guild);
    await addTransaction({
      id: createTransactionId(),
      type: 'worldcup',
      action: 'lock',
      status: 'active',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
      reason: 'World Cup roster lock enabled',
      timestamp: new Date().toISOString(),
    }).catch(() => null);
    await addActivityEvent({
      emoji: '🏆',
      text: 'World Cup Mode activated',
      type: 'worldCupLock',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
    }).catch(() => null);

    const lockEmbed = new EmbedBuilder()
      .setTitle('🏆 World Cup Mode Activated')
      .setDescription('The RSA World Cup roster lock is now active.')
      .setColor('#00B37E')
      .addFields(
        { name: '🔒 Transfer Window', value: 'Closed', inline: true },
        { name: '⚖ Cup Tied Enforcement', value: 'Enabled', inline: true },
        { name: '🛡 Roster Protection', value: 'Enabled', inline: true },
        { name: '📋 Auditing', value: 'Enabled', inline: true },
        { name: '📸 Snapshot', value: 'Created Successfully', inline: true }
      )
      .setFooter({ text: 'RSA | Roblox Soccer Association' })
      .setTimestamp();

    const snapshotEmbed = new EmbedBuilder()
      .setTitle('📸 World Cup Snapshot Created')
      .setDescription('An official World Cup roster snapshot has been created.')
      .setColor('#F9A825')
      .addFields(
        { name: '📂 Backup Files', value: 'teams.json\ntransactions.json\nsettings.json', inline: false },
        { name: '🕒 Timestamp', value: snapshot.timestamp, inline: true },
        { name: '👤 Activated By', value: `<@${interaction.user.id}>`, inline: true },
        { name: '🧾 Audit Issues', value: `${audit.summary.multipleNationRoles + audit.summary.cupTiedViolations + audit.summary.sanctionedOnRoster + audit.summary.missingRosterEntries + audit.summary.rosterLimitViolations + audit.summary.unauthorizedTeamAssignments + audit.summary.duplicateRosterEntries} issues found`, inline: false }
      )
      .setFooter({ text: 'RSA | Roblox Soccer Association' })
      .setTimestamp();

    const contractsChannel = await interaction.client.channels.fetch(settings.contractsChannelId).catch(() => null);
    if (contractsChannel && contractsChannel.isTextBased()) {
      await contractsChannel.send({ embeds: [lockEmbed, snapshotEmbed] }).catch(() => null);
    }

    await interaction.reply({ embeds: [lockEmbed], ephemeral: false });
  },
};
