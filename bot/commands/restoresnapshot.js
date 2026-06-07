const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { memberHasRoleNames } = require('../utils/permissions');
const { createSnapshot, restoreSnapshot, findMatchingSnapshotId } = require('../utils/snapshot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restoresnapshot')
    .setDescription('Restore the RSA system from a historical World Cup snapshot')
    .addStringOption((option) =>
      option
        .setName('snapshot')
        .setDescription('Snapshot timestamp or ID to restore')
        .setRequired(true)
    ),

  async execute(interaction) {
    const settings = await loadSettings();
    if (!memberHasRoleNames(interaction.member, settings.worldCupUnlockRoleNames)) {
      await interaction.reply({ content: '❌ You do not have permission to use /restoresnapshot.', flags: 64 });
      return;
    }

    const snapshotId = interaction.options.getString('snapshot', true).trim();
    await interaction.deferReply({ flags: 64 });

    const snapshotName = await findMatchingSnapshotId(snapshotId);
    if (!snapshotName) {
      await interaction.editReply({ content: `❌ Snapshot not found for ID: ${snapshotId}` });
      return;
    }

    await createSnapshot('pre-restore');

    try {
      const restored = await restoreSnapshot(snapshotName);
      const embed = new EmbedBuilder()
        .setTitle('♻️ RSA Snapshot Restored')
        .setColor('#0099ff')
        .addFields(
          { name: '📂 Snapshot', value: restored, inline: false },
          { name: '👤 Restored By', value: `<@${interaction.user.id}>`, inline: true },
          { name: '🕒 Timestamp', value: new Date().toISOString(), inline: true }
        )
        .setFooter({ text: 'RSA | Roblox Soccer Association' })
        .setTimestamp();

      const contractsChannel = await interaction.client.channels.fetch(settings.contractsChannelId).catch(() => null);
      if (contractsChannel && contractsChannel.isTextBased()) {
        await contractsChannel.send({ embeds: [embed] }).catch(() => null);
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: `❌ Restore failed: ${error.message}` });
    }
  },
};
