const { SlashCommandBuilder, ChannelType } = require('discord.js');
const staffCentreStorage = require('../utils/staffCentreStorage');
const { scanStaffCentre, buildStaffCentreEmbed } = require('../utils/staffCentre');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffcentre')
    .setDescription('Create or update the RSA Staff Centre dashboard'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command can only be run in a server.');
      return;
    }

    try {
      const staffCentre = await staffCentreStorage.load();
      let staffCentreChannel = null;
      let staffCentreMessage = null;
      let isNewMessage = false;

      if (staffCentre.guildId === guild.id && staffCentre.channelId) {
        staffCentreChannel = await guild.channels.fetch(staffCentre.channelId).catch(() => null);
      }

      if (!staffCentreChannel) {
        staffCentreChannel = await guild.channels.create({
          name: 'rsa-staff-centre',
          type: ChannelType.GuildText,
          topic: 'RSA Staff Centre — automatically updated as staff roles change',
          reason: 'RSA Staff Centre Auto-Creation',
        });
      }

      if (staffCentre.guildId === guild.id && staffCentre.messageId && staffCentreChannel) {
        staffCentreMessage = await staffCentreChannel.messages.fetch(staffCentre.messageId).catch(() => null);
      }

      const staffRoles = await scanStaffCentre(guild);
      const embed = buildStaffCentreEmbed(staffRoles);

      if (staffCentreMessage) {
        await staffCentreMessage.edit({ embeds: [embed] });
      } else {
        staffCentreMessage = await staffCentreChannel.send({ embeds: [embed] });
        isNewMessage = true;
      }

      staffCentre.guildId = guild.id;
      staffCentre.channelId = staffCentreChannel.id;
      staffCentre.messageId = staffCentreMessage.id;
      staffCentre.lastUpdated = new Date().toISOString();
      if (!staffCentre.createdAt) {
        staffCentre.createdAt = new Date().toISOString();
      }

      await staffCentreStorage.save(staffCentre);

      await interaction.editReply(`✅ RSA Staff Centre ${isNewMessage ? 'created' : 'updated'} in <#${staffCentreChannel.id}>`);
    } catch (error) {
      console.error('Error creating or updating Staff Centre:', error);
      await interaction.editReply(`❌ Failed to build RSA Staff Centre: ${error.message}`);
    }
  },
};
