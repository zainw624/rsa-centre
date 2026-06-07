const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addActivityEvent } = require('../utils/dashboardStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the guild (owner only)')
    .addUserOption((opt) => opt.setName('target').setDescription('User to ban').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason for ban').setRequired(false)),

  async execute(interaction) {
    const ownerId = process.env.BOT_OWNER_ID || process.env.BOT_OWNER || null;
    if (!ownerId || interaction.user.id !== ownerId) {
      await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
      return;
    }

    const target = interaction.options.getUser('target', true);
    const reason = interaction.options.getString('reason') || `Banned by owner ${interaction.user.id}`;

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot ban yourself.', ephemeral: true });
      return;
    }

    if (target.id === interaction.client.user.id) {
      await interaction.reply({ content: '❌ I cannot ban myself.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: false });

    try {
      // Attempt to ban by member first, fallback to guild.bans
      if (interaction.guild && interaction.guild.members) {
        await interaction.guild.members.ban(target.id, { reason }).catch(async () => {
          // fallback
          if (interaction.guild.bans) await interaction.guild.bans.create(target.id, { reason }).catch(() => null);
        });
      } else if (interaction.guild && interaction.guild.bans) {
        await interaction.guild.bans.create(target.id, { reason }).catch(() => null);
      }

      await addActivityEvent({ emoji: '⛔', text: `Banned ${target.tag || target.id}: ${reason}`, guildId: interaction.guild?.id, staffId: interaction.user.id, playerId: target.id }).catch(() => null);

      const embed = new EmbedBuilder().setTitle('User Banned').setDescription(`<@${target.id}> has been banned.`).addFields({ name: 'Reason', value: reason }).setColor('#E11D48').setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing /ban:', error);
      await interaction.editReply({ content: `❌ Failed to ban <@${target.id}>.`, ephemeral: true });
    }
  },
};
