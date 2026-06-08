/**
 * RSA Bot — /announcefa slash command
 * =====================================
 * Announces a player's free agency status.
 * Only users with the "Free Agent" role may use this command.
 * Must be used in the bot commands channel.
 * Sends announcement to the free agency channel.
 *
 * Channel IDs:
 *   Bot commands:  1512871626637578371  (command must be run here)
 *   Free agency:   1512857513710846055  (announcement posted here)
 */

'use strict';

const { SlashCommandBuilder } = require('discord.js');

const BOT_COMMANDS_CHANNEL_ID = '1512871626637578371';
const FREE_AGENCY_CHANNEL_ID  = '1512857513710846055';
const FREE_AGENT_ROLE_NAME    = 'Free Agent';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcefa')
    .setDescription('Announce your free agency to RSA managers')
    .addStringOption((o) =>
      o.setName('message')
        .setDescription('Optional message to include in your announcement')
        .setRequired(false),
    ),

  async execute(interaction) {
    // Must be used in bot commands channel
    if (interaction.channelId !== BOT_COMMANDS_CHANNEL_ID) {
      return interaction.reply({
        content: `❌ This command can only be used in <#${BOT_COMMANDS_CHANNEL_ID}>.`,
        flags: 64,
      });
    }

    // Must have Free Agent role
    const hasFARole = interaction.member.roles.cache.some((r) => r.name === FREE_AGENT_ROLE_NAME);
    if (!hasFARole) {
      return interaction.reply({
        content: '❌ Only players with the Free Agent role may use this command.',
        flags: 64,
      });
    }

    const message = interaction.options.getString('message') ?? '';
    await interaction.deferReply({ ephemeral: true });

    const faChannel = await interaction.client.channels.fetch(FREE_AGENCY_CHANNEL_ID).catch(() => null);
    if (!faChannel?.isTextBased()) {
      return interaction.editReply({ content: '❌ Could not find the free agency channel. Contact an admin.' });
    }

    await faChannel.send({
      embeds: [{
        color: 0xC9A55A,
        title: '🔓 Free Agent Available',
        description: message || 'This player is available and looking for a national team.',
        fields: [
          { name: 'Player', value: `<@${interaction.user.id}>`, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'RSA Operations Centre · Free Agency' },
      }],
    });

    return interaction.editReply({ content: '✅ Your free agency announcement has been posted.' });
  },
};
