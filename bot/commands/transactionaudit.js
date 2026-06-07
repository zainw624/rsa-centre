const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { loadTransactions, getRecentTransactions } = require('../utils/transactions');
const { memberHasRoleNames } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transactionaudit')
    .setDescription('View RSA transaction history and audit summary'),

  async execute(interaction) {
    const settings = await loadSettings();
    if (!memberHasRoleNames(interaction.member, settings.auditRoleNames)) {
      await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: 64 });
      return;
    }

    await interaction.deferReply({ flags: 64 });
    const transactions = await loadTransactions();
    const recent = await getRecentTransactions(10);

    const typeCounts = transactions.reduce((counts, transaction) => {
      counts[transaction.type] = (counts[transaction.type] || 0) + 1;
      return counts;
    }, {});

    const embed = new EmbedBuilder()
      .setTitle('📜 Transaction Audit')
      .setColor('#0099E1')
      .addFields(
        { name: 'Total Transactions', value: `${transactions.length}`, inline: true },
        { name: 'Signings', value: `${typeCounts.sign || 0}`, inline: true },
        { name: 'Releases', value: `${typeCounts.release || 0}`, inline: true },
        { name: 'Declined Contracts', value: `${typeCounts.declined || 0}`, inline: true },
        { name: 'Sanctions', value: `${typeCounts.Sanctioned || 0}`, inline: true },
        { name: 'Cup Tied actions', value: `${typeCounts['Cup Tied'] || 0}`, inline: true },
        { name: 'Flagged / Illegal', value: `${typeCounts.illegal || 0}`, inline: true },
      { name: 'World Cup Actions', value: `${typeCounts.worldcup || 0}`, inline: true }
      )
      .setFooter({ text: 'RSA Transaction Audit' })
      .setTimestamp();

    if (recent.length) {
      embed.addFields({ name: 'Recent Transactions', value: recent.map((tx) => `• ${tx.type} | ${tx.playerTag || tx.playerId} | ${tx.teamName || 'N/A'} | ${tx.status}`).join('\n'), inline: false });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
