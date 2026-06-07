/**
 * RSA Bot — guildMemberAdd event (with role-sync)
 * ================================================
 * Fires when a new member joins the Discord server.
 * Pushes their initial role state (likely just @everyone) to the website.
 */

'use strict';

const { pushRoleSync } = require('../role-sync-helper');

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member) {
    if (!member) return;

    pushRoleSync(member, 'member_join').catch((err) => {
      console.warn('[guildMemberAdd] role-sync push failed:', err?.message);
    });
  },
};
