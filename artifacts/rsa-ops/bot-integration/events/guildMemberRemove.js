/**
 * RSA Bot — guildMemberRemove event (with role-sync)
 * ===================================================
 * Fires when a member leaves the Discord server.
 * Notifies the website so roster/manager entries can be deactivated.
 */

'use strict';

const { pushMemberLeave } = require('../role-sync-helper');

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    if (!member) return;

    pushMemberLeave(member).catch((err) => {
      console.warn('[guildMemberRemove] role-sync push failed:', err?.message);
    });
  },
};
