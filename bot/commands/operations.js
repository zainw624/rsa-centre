const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('operations')
    .setDescription('Display RSA Operations Centre status and system health'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const embed = new EmbedBuilder()
        .setTitle('RSA Operations Centre')
        .setDescription('Backend operations platform for leadership, compliance, fixtures, transfers, and team management.')
        .addFields(
          { name: 'System Status', value: 'Online', inline: true },
          { name: 'Architecture', value: 'Modular • Resilient • JSON-backed', inline: true }
        )
        .setColor('#1f1f1f')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Operations command error:', error);
      await interaction.editReply({ content: 'Unable to load operations status at this time.' });
    }
  },
};
