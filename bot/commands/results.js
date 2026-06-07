const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { memberHasRoleNames } = require('../utils/permissions');
const { buildResultAddEmbed, buildResultEditEmbed, buildResultDeleteEmbed, buildResultsListEmbed, buildTeamResultsEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('results')
    .setDescription('Manage match results')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a new match result')
        .addStringOption((option) =>
          option.setName('home_team').setDescription('Home team name').setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('away_team').setDescription('Away team name').setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName('home_score').setDescription('Home team score').setRequired(true).setMinValue(0)
        )
        .addIntegerOption((option) =>
          option.setName('away_score').setDescription('Away team score').setRequired(true).setMinValue(0)
        )
        .addStringOption((option) =>
          option.setName('date').setDescription('Match date (YYYY-MM-DD)').setRequired(false)
        )
        .addStringOption((option) =>
          option.setName('competition').setDescription('Competition name').setRequired(false)
        )
        .addStringOption((option) =>
          option.setName('stadium').setDescription('Stadium/venue name').setRequired(false)
        )
        .addIntegerOption((option) =>
          option.setName('attendance').setDescription('Attendance number').setRequired(false).setMinValue(0)
        )
        .addStringOption((option) =>
          option.setName('notes').setDescription('Additional notes').setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('edit')
        .setDescription('Edit a match result')
        .addStringOption((option) =>
          option.setName('result_id').setDescription('Result ID to edit').setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName('home_score').setDescription('New home team score').setRequired(false).setMinValue(0)
        )
        .addIntegerOption((option) =>
          option.setName('away_score').setDescription('New away team score').setRequired(false).setMinValue(0)
        )
        .addStringOption((option) =>
          option.setName('notes').setDescription('Updated notes').setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a match result')
        .addStringOption((option) =>
          option.setName('result_id').setDescription('Result ID to remove').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('view').setDescription('View recent results')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('team')
        .setDescription('View results for a specific team')
        .addStringOption((option) =>
          option.setName('team_name').setDescription('Team name').setRequired(true)
        )
    ),

  async execute(interaction) {
    const resultsManager = interaction.client.resultsManager;
    const subcommand = interaction.options.getSubcommand();

    // Check permissions for add, edit, remove
    const editRoles = ['RSA', 'Officials', 'Bot Owner'];
    const hasPermission = memberHasRoleNames(interaction.member, editRoles) || interaction.user.id === interaction.guild.ownerId;

    if (['add', 'edit', 'remove'].includes(subcommand) && !hasPermission) {
      await interaction.reply({
        content: '❌ You do not have permission to manage results. Only RSA | Officials and Bot Owner can add, edit, or remove results.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      if (subcommand === 'add') {
        const homeTeam = interaction.options.getString('home_team');
        const awayTeam = interaction.options.getString('away_team');
        const homeScore = interaction.options.getInteger('home_score');
        const awayScore = interaction.options.getInteger('away_score');
        const date = interaction.options.getString('date');
        const competition = interaction.options.getString('competition');
        const stadium = interaction.options.getString('stadium');
        const attendance = interaction.options.getInteger('attendance');
        const notes = interaction.options.getString('notes');

        const result = await resultsManager.addResult({
          homeTeam,
          awayTeam,
          homeScore,
          awayScore,
          date: date ? new Date(date).toISOString() : undefined,
          competition,
          stadium,
          attendance,
          notes,
          addedBy: interaction.user.id,
        });

        const embed = buildResultAddEmbed(result, `<@${interaction.user.id}>`);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'edit') {
        const resultId = interaction.options.getString('result_id');
        const homeScore = interaction.options.getInteger('home_score');
        const awayScore = interaction.options.getInteger('away_score');
        const notes = interaction.options.getString('notes');

        const result = resultsManager.getResultById(resultId);
        if (!result) {
          await interaction.editReply({ content: `❌ Result with ID "${resultId}" not found.` });
          return;
        }

        const updates = {
          editedBy: interaction.user.id,
        };
        if (homeScore !== null) updates.homeScore = homeScore;
        if (awayScore !== null) updates.awayScore = awayScore;
        if (notes !== null) updates.notes = notes;

        const updated = await resultsManager.editResult(resultId, updates);
        const embed = buildResultEditEmbed(updated, `<@${interaction.user.id}>`);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'remove') {
        const resultId = interaction.options.getString('result_id');

        const result = resultsManager.getResultById(resultId);
        if (!result) {
          await interaction.editReply({ content: `❌ Result with ID "${resultId}" not found.` });
          return;
        }

        await resultsManager.removeResult(resultId);
        const embed = buildResultDeleteEmbed(result, `<@${interaction.user.id}>`);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'view') {
        const results = resultsManager.getRecentResults(10);
        const embed = buildResultsListEmbed(results);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'team') {
        const teamName = interaction.options.getString('team_name');
        const allResults = resultsManager.getAllResults();
        const embed = buildTeamResultsEmbed(allResults, teamName);
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error in results command:', error);
      await interaction.editReply({
        content: '❌ An error occurred while processing the results command.',
      });
    }
  },
};
