const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { memberHasRoleNames } = require('../utils/permissions');
const { runAdvancedAudit } = require('../utils/audit');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auditrosters')
    .setDescription('Audit team rosters for inconsistencies'),

  async execute(interaction) {
    const settings = await loadSettings();
    if (!memberHasRoleNames(interaction.member, settings.auditRoleNames)) {
      await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: 64 });
      return;
    }

    await interaction.deferReply({ flags: 64 });
    await interaction.guild.members.fetch();

    const audit = await runAdvancedAudit(interaction.guild);
    const { issues } = audit;

    const embed = new EmbedBuilder()
      .setTitle('🧾 Roster Audit Results')
      .setColor('#FAA61A')
      .addFields(
        { name: 'Roster limits', value: issues.rosterLimitViolations.length ? issues.rosterLimitViolations.slice(0, 5).join('\n') : 'None', inline: false },
        { name: 'Missing roster entries', value: issues.missingRosterEntries.length ? issues.missingRosterEntries.slice(0, 5).join('\n') : 'None', inline: false },
        { name: 'Unauthorized assignments', value: issues.unauthorizedTeamAssignments.length ? issues.unauthorizedTeamAssignments.slice(0, 5).join('\n') : 'None', inline: false },
        { name: 'Duplicate entries', value: issues.duplicateRosterEntries.length ? issues.duplicateRosterEntries.slice(0, 5).join('\n') : 'None', inline: false },
        { name: 'Cup Tied violations', value: issues.cupTiedViolations.length ? issues.cupTiedViolations.slice(0, 5).join('\n') : 'None', inline: false },
        { name: 'Sanctioned on roster', value: issues.sanctionedOnRoster.length ? issues.sanctionedOnRoster.slice(0, 5).join('\n') : 'None', inline: false },
        { name: 'Multiple nation roles', value: issues.multipleNationRoles.length ? issues.multipleNationRoles.slice(0, 5).join('\n') : 'None', inline: false }
      )
      .setFooter({ text: 'RSA Roster Audit' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    const contractsChannel = await interaction.client.channels.fetch(settings.contractsChannelId).catch(() => null);
    if (contractsChannel && contractsChannel.isTextBased()) {
      await contractsChannel.send({ embeds: [embed] }).catch(() => null);
    }
  },
};
