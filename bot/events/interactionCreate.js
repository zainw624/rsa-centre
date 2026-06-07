const { InteractionType } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    try {
      if (interaction.type === InteractionType.ApplicationCommand) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
          return;
        }
        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        if (interaction.customId.startsWith('rsa-sign-')) {
          const signCommand = interaction.client.commands.get('sign');
          if (signCommand && typeof signCommand.handleButtonInteraction === 'function') {
            await signCommand.handleButtonInteraction(interaction);
          }
        }
      }
    } catch (error) {
      console.error('Interaction error:', error);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ content: '❌ An unexpected error occurred while processing this interaction.', embeds: [] });
        } else {
          await interaction.reply({ content: '❌ An unexpected error occurred while processing this interaction.', flags: 64 });
        }
      } catch {
        // ignore reply errors
      }
    }
  },
};
