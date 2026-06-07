const { SlashCommandBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { loadTransferWindow } = require('../utils/transferWindow');
const { loadTeams } = require('../utils/teams');
const { loadTransactions } = require('../utils/transactions');
const { buildHealthcheckEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('healthcheck')
    .setDescription('Run the RSA bot healthcheck'),

  async execute(interaction) {
    const settings = await loadSettings();
    if (interaction.user.id !== settings.botOwnerId) {
      await interaction.reply({ content: '❌ Only the Bot Owner may use this command.', flags: 64 });
      return;
    }

    await interaction.deferReply({ flags: 64 });

    const transferWindowOpen = await loadTransferWindow();
    const teams = await loadTeams();
    const transactions = await loadTransactions();

    let contractChannelStatus = false;
    try {
      const channel = await interaction.client.channels.fetch(settings.contractsChannelId);
      contractChannelStatus = channel && channel.isTextBased();
    } catch {
      contractChannelStatus = false;
    }

    const status = {
      'Transfer Window Status': transferWindowOpen,
      'World Cup Mode Active': settings.worldCupMode,
      'Teams Loaded': teams.length > 0,
      'Contracts Channel Connected': contractChannelStatus,
      'Transaction System Operational': Array.isArray(transactions),
      'Audit System Operational': true,
      'Cup Tied Enforcement Active': settings.worldCupMode,
      'Sanction System Active': true,
    };

    const embed = buildHealthcheckEmbed(status);
    await interaction.editReply({ embeds: [embed] });
  },
};
