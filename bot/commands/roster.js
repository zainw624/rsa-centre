const { SlashCommandBuilder } = require('discord.js');
const { getTeamByName, syncRostersFromGuildRoles } = require('../utils/teams');
const { buildRosterEmbed } = require('../utils/embeds');
const teamsData = require('../data/teams.json');

const TEAM_CHOICES = teamsData.teams.map((team) => ({
  name: team.teamName,
  value: team.teamName,
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

    const teamName = interaction.options.getString('team');
    await syncRostersFromGuildRoles(interaction.guild);
    const team = await getTeamByName(teamName);
    if (!team) {
      await interaction.editReply({ content: `❌ Team "${teamName}" not found.` });
      return;
    }

    const embed = buildRosterEmbed(team);
    await interaction.editReply({ embeds: [embed] });
  },
};
