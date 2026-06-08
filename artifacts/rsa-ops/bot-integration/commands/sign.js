/**
 * RSA Bot — /sign slash command
 * ==============================
 * Signs a player to a national team roster.
 * Manager permission required.
 * Sends announcement to the signings channel.
 *
 * Required env vars on the BOT side:
 *   WEBSITE_URL        - Base URL of RSA Ops site
 *   ROLES_SYNC_SECRET  - Shared sync secret
 *
 * Channel IDs:
 *   Signings:      1512857515858329841
 *   Bot commands:  1512871626637578371
 */

'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { pushRoleSync } = require('../role-sync-helper');

const SIGNINGS_CHANNEL_ID = '1512857515858329841';
const MANAGER_ROLE_NAMES  = ['RSA | Managers', 'RSA | Assistant Managers'];

function hasManagerRole(member) {
  return member.roles.cache.some((r) => MANAGER_ROLE_NAMES.includes(r.name));
}

async function notifyWebsite(member) {
  // Re-sync the player so the website roster updates immediately
  return pushRoleSync(member, 'member_update').catch(() => null);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sign')
    .setDescription('Sign a player to your national team roster')
    .addUserOption((o) => o.setName('player').setDescription('Player to sign').setRequired(true))
    .addStringOption((o) => o.setName('reason').setDescription('Optional reason/note')),

  async execute(interaction) {
    if (!hasManagerRole(interaction.member)) {
      return interaction.reply({ content: '❌ Only managers may use this command.', flags: 64 });
    }

    const player  = interaction.options.getMember('player');
    const reason  = interaction.options.getString('reason') ?? '';
    if (!player) return interaction.reply({ content: '❌ Player not found in this server.', flags: 64 });

    await interaction.deferReply({ ephemeral: true });

    // Push role sync so website roster updates
    await notifyWebsite(player);

    // Send announcement to signings channel
    const signingsChannel = await interaction.client.channels.fetch(SIGNINGS_CHANNEL_ID).catch(() => null);
    if (signingsChannel?.isTextBased()) {
      await signingsChannel.send({
        embeds: [{
          color: 0xC9A55A,
          title: '✍️ New Signing',
          fields: [
            { name: 'Player',  value: `<@${player.id}>`,           inline: true },
            { name: 'Manager', value: `<@${interaction.user.id}>`, inline: true },
            ...(reason ? [{ name: 'Note', value: reason, inline: false }] : []),
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'RSA Operations Centre' },
        }],
      }).catch(() => null);
    }

    return interaction.editReply({
      content: `✅ <@${player.id}> has been signed. Website roster will update automatically.`,
    });
  },
};
