const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { memberHasRoleNames } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Deploy or manage the RSA Operations Centre dashboard')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    try {
      const client = interaction.client;
      const guild = interaction.guild;

      // Permission check
      const hasPermission = memberHasRoleNames(interaction.member, ['RSA | Officials', 'Bot Owner', 'Guild Owner']);
      const isGuildOwner = interaction.user.id === guild.ownerId;

      if (!hasPermission && !isGuildOwner) {
        return interaction.editReply({
          content: '❌ You do not have permission to deploy the Operations Centre.',
        });
      }

      // Validate operations centre is initialized
      if (!client.operationsCenter) {
        const OperationsCenter = require('../services/OperationsCenter');
        client.operationsCenter = new OperationsCenter();
        try {
          await client.operationsCenter.initialize();
        } catch (err) {
          console.error('[Dashboard] Error initializing Operations Centre:', err);
          return interaction.editReply({
            content: '❌ Failed to initialize Operations Centre. Please try again.',
          });
        }
      }

      // Validate required services exist
      const requiredServices = ['managersDashboard', 'resultsManager', 'complianceEngine', 'transferManager', 'fixtureManager'];
      const missingServices = requiredServices.filter((service) => !client[service]);

      if (missingServices.length > 0) {
        return interaction.editReply({
          content: `❌ Missing required services: ${missingServices.join(', ')}. Please restart the bot.`,
        });
      }

      // Get or create dedicated channel
      let dashboardChannel = null;

      if (client.operationsCenter.state?.channelId) {
        try {
          dashboardChannel = await guild.channels.fetch(client.operationsCenter.state.channelId);
        } catch (err) {
          console.warn('[Dashboard] Existing dashboard channel not found, will create new:', err.message);
        }
      }

      if (!dashboardChannel) {
        try {
          dashboardChannel = await guild.channels.create({
            name: 'rsa-operations-centre',
            type: ChannelType.GuildText,
            topic: 'RSA Operations Centre — automatically synchronized with all systems',
            permissionOverwrites: [
              {
                id: guild.id,
                allow: ['ViewChannel', 'ReadMessageHistory'],
                deny: ['SendMessages'],
              },
              {
                id: client.user.id,
                allow: ['SendMessages', 'EmbedLinks', 'ManageMessages'],
              },
            ],
            reason: 'RSA Operations Centre dashboard channel',
          });
          console.log(`[Dashboard] Created new channel: ${dashboardChannel.id}`);
        } catch (err) {
          console.error('[Dashboard] Error creating channel:', err);
          return interaction.editReply({
            content: `❌ Failed to create dashboard channel: ${err.message}`,
          });
        }
      }

      // Build the first page (Dashboard)
      let pageEmbed = null;
      let navigationButtons = null;

      try {
        pageEmbed = await client.operationsCenter.buildPage(0, client);
        navigationButtons = client.operationsCenter.getNavigationButtons(0);
      } catch (err) {
        console.error('[Dashboard] Error building page:', err);
        return interaction.editReply({
          content: `❌ Failed to build dashboard page: ${err.message}`,
        });
      }

      // Send or update message
      let dashboardMessage = null;

      if (client.operationsCenter.state?.messageId) {
        try {
          dashboardMessage = await dashboardChannel.messages.fetch(client.operationsCenter.state.messageId);
        } catch (err) {
          console.warn('[Dashboard] Existing message not found, will create new:', err.message);
        }
      }

      try {
        const rsaPath = path.join(process.cwd(), 'assets', 'rsa1.png');
        const filesToSend = [];
        if (fs.existsSync(rsaPath)) filesToSend.push(rsaPath);

        if (dashboardMessage) {
          // Update existing message
          const editPayload = { embeds: [pageEmbed], components: navigationButtons };
          if (filesToSend.length) editPayload.files = filesToSend;
          await dashboardMessage.edit(editPayload);
          console.log('[Dashboard] Updated existing dashboard message');
        } else {
          // Create new message
          const sendPayload = { embeds: [pageEmbed], components: navigationButtons };
          if (filesToSend.length) sendPayload.files = filesToSend;
          dashboardMessage = await dashboardChannel.send(sendPayload);
          console.log('[Dashboard] Created new dashboard message');
        }
      } catch (err) {
        console.error('[Dashboard] Error sending/updating message:', err);
        return interaction.editReply({
          content: `❌ Failed to send dashboard message: ${err.message}`,
        });
      }

      // Save dashboard info
      try {
        await client.operationsCenter.setDashboardInfo(guild.id, dashboardChannel.id, dashboardMessage.id);
      } catch (err) {
        console.error('[Dashboard] Error saving dashboard info:', err);
        return interaction.editReply({
          content: `❌ Failed to save dashboard information: ${err.message}`,
        });
      }

      client.operationsCenter.logActivity(`🚀 Dashboard deployed by ${interaction.user.username}`);

      return interaction.editReply({
        content: `✅ **Operations Centre Deployed Successfully**\n\n📍 Channel: ${dashboardChannel}\n💾 Message ID: \`${dashboardMessage.id}\`\n\n🎯 The dashboard is now live and will automatically update with all system changes. All pages are synchronized in real-time.`,
      });
    } catch (error) {
      console.error('[Dashboard] Unexpected error:', error);
      return interaction.editReply({
        content: `❌ Unexpected error deploying Operations Centre: ${error.message}`,
      });
    }
  },
};
