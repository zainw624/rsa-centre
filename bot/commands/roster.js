const { SlashCommandBuilder } = require('discord.js');
const { getTeamById, syncRostersFromGuildRoles } = require('../utils/teams');
const { buildRosterEmbed } = require('../utils/embeds');
const teamsData = require('../data/teams.json');

const TEAM_CHOICES = teamsData.teams.map((team) => ({
  name: team.teamName,
  value: team.teamId,
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roster')
    .setDescription('View RSA national team roster')
    .addStringOption((option) =>
      option
        .setName('team')
        .setDescription('Select a national team')
        .setRequired(true)
        .addChoices(...TEAM_CHOICES)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const teamId = interaction.options.getString('team');
    await syncRostersFromGuildRoles(interaction.guild);
    const team = await getTeamById(teamId);
    if (!team) {
      await interaction.editReply({ content: '❌ Team not found.' });
      return;
    }

    const embed = buildRosterEmbed(team);
    await interaction.editReply({ embeds: [embed] });
  },
};
