const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUpcomingFixtures } = require('../utils/fixtures');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fixtures')
    .setDescription('Show the current upcoming fixtures from the RSA Fixtures Centre'),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: false });
      const fixtures = await getUpcomingFixtures(10);

      const embed = new EmbedBuilder()
        .setTitle('RSA Fixtures Centre')
        .setDescription('Upcoming scheduled fixtures')
        .setColor('#1f1f1f')
        .setTimestamp();

      if (fixtures.length === 0) {
        embed.addFields({ name: 'No fixtures scheduled', value: 'The Fixtures Centre is currently empty.', inline: false });
      } else {
        const lines = fixtures.map((fixture, index) => {
          const kickoffTs = Math.floor(new Date(fixture.kickoff).getTime() / 1000);
          return `**${index + 1}.** ${fixture.homeTeam} vs ${fixture.awayTeam}\n` +
            `• ${fixture.competition} · <t:${kickoffTs}:f> · ${fixture.venue}` +
            (fixture.notes ? `\n• Notes: ${fixture.notes}` : '');
        });

        embed.addFields({ name: 'Upcoming Fixtures', value: lines.join('\n\n'), inline: false });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to display fixtures:', error);
      await interaction.editReply({ content: 'Unable to load upcoming fixtures at this time.' });
    }
  },
};
