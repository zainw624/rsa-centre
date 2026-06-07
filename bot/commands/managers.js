const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { buildManagersDashboardEmbed, buildManagersEmbed, buildLeadershipSummaryEmbed, buildVacancyEmbed } = require('../utils/managers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('managers')
    .setDescription('View and manage team leadership dashboard')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('dashboard')
        .setDescription('Create or update the live managers dashboard')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('View all team leadership information')
        .addStringOption((option) =>
          option
            .setName('filter')
            .setDescription('Filter teams by status')
            .setRequired(false)
            .addChoices(
              { name: 'Fully Staffed', value: 'fully_staffed' },
              { name: 'Needs Assistants', value: 'needs_assistants' },
              { name: 'Vacant', value: 'vacant' },
              { name: 'All', value: 'all' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('team')
        .setDescription('View leadership for a specific team')
        .addStringOption((option) =>
          option.setName('team_name').setDescription('Team name').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('summary')
        .setDescription('View leadership summary statistics')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('vacancies')
        .setDescription('View all open leadership positions')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('refresh')
        .setDescription('Manually refresh the leadership dashboard')
    ),

  async execute(interaction) {
    const managersDashboard = interaction.client.managersDashboard;
    const leagueMonitor = interaction.client.leagueMonitor;

    if (!managersDashboard || !leagueMonitor) {
      await interaction.reply({
        content: '❌ Leadership dashboard not initialized.',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    await interaction.deferReply({ ephemeral: subcommand === 'refresh' });

    try {
      if (subcommand === 'dashboard') {
        // Create or update the dashboard
        let managersChannel = null;
        let managersMessage = null;
        let isNewMessage = false;

        if (managersDashboard.guildId === interaction.guild.id && managersDashboard.channelId) {
          managersChannel = await interaction.guild.channels.fetch(managersDashboard.channelId).catch(() => null);
        }

        if (!managersChannel) {
          managersChannel = await interaction.guild.channels.create({
            name: 'rsa-managers-dashboard',
            type: ChannelType.GuildText,
            topic: 'RSA Leadership Dashboard — automatically updated as managers change',
            reason: 'RSA Managers Dashboard Auto-Creation',
          });
        }

        // Update leadership data
        await managersDashboard.updateLeadership(interaction.guild);
        const leadership = managersDashboard.getLeadership();

        const dashboardEmbed = buildManagersDashboardEmbed(leadership);

        if (
          managersDashboard.messageId &&
          managersChannel
        ) {
          managersMessage = await managersChannel.messages.fetch(managersDashboard.messageId).catch(() => null);
        }

        if (managersMessage) {
          await managersMessage.edit({ embeds: [dashboardEmbed] });
        } else {
          managersMessage = await managersChannel.send({ embeds: [dashboardEmbed] });
          isNewMessage = true;
        }

        managersDashboard.setDashboardInfo(interaction.guild.id, managersChannel.id, managersMessage.id);
        await managersDashboard.sync();

        await interaction.editReply({
          content: `✅ Managers dashboard ${isNewMessage ? 'created' : 'updated'} in <#${managersChannel.id}>`,
          ephemeral: true,
        });
      } else if (subcommand === 'view') {
        // View all team leadership
        await managersDashboard.updateLeadership(interaction.guild);
        const leadership = managersDashboard.getLeadership();

        const filter = interaction.options.getString('filter') || 'all';
        let teams = Object.values(leadership);

        if (filter === 'fully_staffed') {
          teams = managersDashboard.getFullyStaffedTeams();
        } else if (filter === 'needs_assistants') {
          teams = managersDashboard.getTeamsNeedingAssistants();
        } else if (filter === 'vacant') {
          teams = managersDashboard.getVacantTeams();
        }

        const embeds = teams.slice(0, 10).map((team) => buildManagersEmbed(team));

        if (embeds.length === 0) {
          await interaction.editReply({
            content: `✅ No teams match the filter "${filter}"`,
          });
        } else {
          await interaction.editReply({
            embeds: embeds,
          });
        }
      } else if (subcommand === 'team') {
        // View specific team
        await managersDashboard.updateLeadership(interaction.guild);
        const teamName = interaction.options.getString('team_name');
        const team = managersDashboard.getTeamLeadership(teamName);

        if (!team) {
          await interaction.editReply({
            content: `❌ Team "${teamName}" not found.`,
          });
          return;
        }

        const embed = buildManagersEmbed(team);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'summary') {
        // View summary
        await managersDashboard.updateLeadership(interaction.guild);
        const summary = managersDashboard.getSummary();
        const embed = buildLeadershipSummaryEmbed(summary);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'vacancies') {
        // View vacant positions
        await managersDashboard.updateLeadership(interaction.guild);
        const vacantTeams = managersDashboard.getVacantTeams();
        const embed = buildVacancyEmbed(vacantTeams);
        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'refresh') {
        // Refresh dashboard
        const result = await managersDashboard.updateLeadership(interaction.guild);

        if (!result) {
          await interaction.editReply({
            content: '❌ Failed to refresh leadership data.',
          });
          return;
        }

        const summary = managersDashboard.getSummary();
        await interaction.editReply({
          content: `✅ Leadership dashboard refreshed.\n🟢 **${summary.fullyStaffed}** fully staffed | 🟡 **${summary.needingAssistants}** need assistants | 🔴 **${summary.vacant}** vacant`,
        });

        // Auto-update main dashboard if it exists
        if (managersDashboard.channelId && managersDashboard.messageId) {
          try {
            const channel = await interaction.guild.channels.fetch(managersDashboard.channelId);
            const message = await channel.messages.fetch(managersDashboard.messageId);
            const leadership = managersDashboard.getLeadership();
            const dashboardEmbed = buildManagersDashboardEmbed(leadership);
            await message.edit({ embeds: [dashboardEmbed] });
          } catch (error) {
            console.warn('⚠️ Could not auto-update dashboard:', error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error in managers command:', error);
      await interaction.editReply({
        content: '❌ An error occurred while processing the managers command.',
      });
    }
  },
};
