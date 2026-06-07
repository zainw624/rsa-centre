const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { memberHasRoleNames } = require('../utils/permissions');
const {
  buildComplianceSummaryEmbed,
  buildComplianceWarningEmbed,
  buildComplianceFeedEmbed,
  buildResolutionGuideEmbed,
} = require('../utils/compliance');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compliance')
    .setDescription('Manage RSA compliance and violations')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('scan')
        .setDescription('Run a full compliance scan across all teams and transfers')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('summary')
        .setDescription('View compliance summary and violation statistics')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('feed')
        .setDescription('View compliance feed with detailed violation information')
        .addIntegerOption((option) =>
          option.setName('page').setDescription('Page number (0-indexed)').setRequired(false).setMinValue(0)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('violations')
        .setDescription('View violations by type or severity')
        .addStringOption((option) =>
          option
            .setName('filter')
            .setDescription('Filter by type or severity')
            .setRequired(false)
            .addChoices(
              { name: 'Critical', value: 'CRITICAL' },
              { name: 'High', value: 'HIGH' },
              { name: 'Medium', value: 'MEDIUM' },
              { name: 'Low', value: 'LOW' },
              { name: 'Illegal Signings', value: 'ILLEGAL_SIGNING' },
              { name: 'Duplicate Managers', value: 'DUPLICATE_MANAGER' },
              { name: 'Duplicate Assistants', value: 'DUPLICATE_ASSISTANT' },
              { name: 'Cup Tied Violations', value: 'CUP_TIED_VIOLATION' },
              { name: 'Missing Managers', value: 'MISSING_MANAGER' },
              { name: 'Roster Violations', value: 'ROSTER_OVERSIZED' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('resolve')
        .setDescription('Mark a warning as resolved')
        .addStringOption((option) =>
          option.setName('warning_id').setDescription('Warning ID to resolve').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('guide')
        .setDescription('Get resolution guide for a violation type')
        .addStringOption((option) =>
          option
            .setName('violation_type')
            .setDescription('Type of violation')
            .setRequired(true)
            .addChoices(
              { name: 'Illegal Signings', value: 'ILLEGAL_SIGNING' },
              { name: 'Duplicate Managers', value: 'DUPLICATE_MANAGER' },
              { name: 'Duplicate Assistants', value: 'DUPLICATE_ASSISTANT' },
              { name: 'Cup Tied Violations', value: 'CUP_TIED_VIOLATION' },
              { name: 'Transfer Window Violations', value: 'TRANSFER_WINDOW_VIOLATION' },
              { name: 'Missing Managers', value: 'MISSING_MANAGER' },
              { name: 'Missing Assistants', value: 'MISSING_ASSISTANTS' },
              { name: 'Oversized Rosters', value: 'ROSTER_OVERSIZED' },
              { name: 'Duplicate Roster Entries', value: 'DUPLICATE_ROSTER_ENTRY' },
              { name: 'Players on Multiple Teams', value: 'PLAYER_MULTIPLE_TEAMS' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('clear').setDescription('Clear old warnings (older than 7 days)')
    ),

  async execute(interaction) {
    const complianceEngine = interaction.client.complianceEngine;
    const leagueMonitor = interaction.client.leagueMonitor;

    // Check permissions
    const adminRoles = ['RSA', 'Officials', 'Bot Owner'];
    const hasPermission = memberHasRoleNames(interaction.member, adminRoles) || interaction.user.id === interaction.guild.ownerId;

    if (!hasPermission) {
      await interaction.reply({
        content: '❌ You do not have permission to use compliance commands.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'scan') {
        // Run full compliance scan
        if (!leagueMonitor || !leagueMonitor.teamManager || !leagueMonitor.transferManager) {
          await interaction.editReply({
            content: '❌ League monitor not fully initialized.',
          });
          return;
        }

        const settings = leagueMonitor.settings || {};
        const teams = leagueMonitor.teamManager.teams || [];
        const transfers = leagueMonitor.transferManager.transfers || [];
        const transferWindowOpen = settings.transferWindowOpen !== false;

        const result = await complianceEngine.runComplianceScan(teams, transfers, interaction.guild, settings, transferWindowOpen);

        const summaryEmbed = buildComplianceSummaryEmbed(complianceEngine.getSummary());
        await interaction.editReply({
          embeds: [summaryEmbed],
        });
      } else if (subcommand === 'summary') {
        const summary = complianceEngine.getSummary();
        const embed = buildComplianceSummaryEmbed(summary);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'feed') {
        const page = interaction.options.getInteger('page') || 0;
        const violations = complianceEngine.violations;
        const embed = buildComplianceFeedEmbed(violations, page, 5);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'violations') {
        const filter = interaction.options.getString('filter');
        let violations = [];

        if (!filter) {
          violations = complianceEngine.violations;
        } else if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(filter)) {
          violations = complianceEngine.getViolationsBySeverity(filter);
        } else {
          violations = complianceEngine.getViolationsByType(filter);
        }

        if (violations.length === 0) {
          await interaction.editReply({
            content: `✅ No violations found for filter: ${filter || 'all'}`,
          });
          return;
        }

        const embeds = violations.slice(0, 10).map((v) => buildComplianceWarningEmbed(v));

        await interaction.editReply({
          embeds: embeds.length > 0 ? embeds : [buildComplianceSummaryEmbed(complianceEngine.getSummary())],
        });
      } else if (subcommand === 'resolve') {
        const warningId = interaction.options.getString('warning_id');
        const warning = await complianceEngine.resolveWarning(warningId);

        if (!warning) {
          await interaction.editReply({
            content: `❌ Warning with ID "${warningId}" not found.`,
          });
          return;
        }

        await interaction.editReply({
          content: `✅ Warning ${warningId} marked as resolved.`,
        });
      } else if (subcommand === 'guide') {
        const violationType = interaction.options.getString('violation_type');
        const embed = buildResolutionGuideEmbed(violationType);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'clear') {
        const clearedCount = await complianceEngine.clearOldWarnings(7);
        await interaction.editReply({
          content: `✅ Cleared ${clearedCount} old warnings.`,
        });
      }
    } catch (error) {
      console.error('Error in compliance command:', error);
      await interaction.editReply({
        content: '❌ An error occurred while processing the compliance command.',
      });
    }
  },
};
