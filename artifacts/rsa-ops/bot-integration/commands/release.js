/**
 * RSA Bot — /release slash command
 * ==================================
 * Releases a player from their current national team roster.
 * Manager permission required.
 * Sends announcement to the releases channel.
 *
 * Required env vars on the BOT side:
 *   WEBSITE_URL        - Base URL of RSA Ops site
 *   ROLES_SYNC_SECRET  - Shared sync secret
 *
 * Channel IDs:
 *   Releases:      1512857516860637386
 *   Bot commands:  1512871626637578371
 */

'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { pushRoleSync } = require('../role-sync-helper');

const RELEASES_CHANNEL_ID = '1512857516860637386';
const MANAGER_ROLE_NAMES  = ['RSA | Managers', 'RSA | Assistant Managers'];

function hasManagerRole(member) {
  return member.roles.cache.some((r) => MANAGER_ROLE_NAMES.includes(r.name));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Release a player from your national team roster')
    .addUserOption((o) => o.setName('player').setDescription('Player to release').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Reason for release')),

  async execute(interaction) {
    if (!hasManagerRole(interaction.member)) {
      return interaction.reply({ content: '❌ Only managers may use this command.', flags: 64 });
    }

    const player = interaction.options.getMember('player');
    const reason = interaction.options.getString('reason') ?? '';
    if (!player) return interaction.reply({ content: '❌ Player not found in this server.', flags: 64 });

    await interaction.deferReply({ ephemeral: true });

    // Push role sync so website roster removes the player
    await pushRoleSync(player, 'member_update').catch(() => null);

    // Send announcement to releases channel
    const releasesChannel = await interaction.client.channels.fetch(RELEASES_CHANNEL_ID).catch(() => null);
    if (releasesChannel?.isTextBased()) {
      await releasesChannel.send({
        embeds: [{
          color: 0xEF4444,
          title: '🚪 Player Released',
          fields: [
            { name: 'Player',  value: `<@${player.id}>`,           inline: true },
            { name: 'Manager', value: `<@${interaction.user.id}>`, inline: true },
            ...(reason ? [{ name: 'Reason', value: reason, inline: false }] : []),
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'RSA Operations Centre' },
        }],
      }).catch(() => null);
    }

    return interaction.editReply({
      content: `✅ <@${player.id}> has been released. Website roster will update automatically.`,
    });
  },
};
