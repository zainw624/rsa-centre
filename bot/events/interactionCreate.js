const { InteractionType } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    try {
      // Handle chat input (slash) commands first, using the safe method when available
      const isChatInput = typeof interaction?.isChatInputCommand === 'function'
        ? interaction.isChatInputCommand()
        : interaction && interaction.type === InteractionType.ApplicationCommand;

      if (isChatInput) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      // Only proceed with button handling if the method exists and returns true
      if (interaction && typeof interaction.isButton === 'function' && interaction.isButton()) {
        if (interaction.customId && interaction.customId.startsWith('rsa-sign-')) {
          const signCommand = interaction.client.commands.get('sign');
          if (signCommand && typeof signCommand.handleButtonInteraction === 'function') {
            await signCommand.handleButtonInteraction(interaction);
          }
        }
      }
    } catch (error) {
      console.error('Interaction error:', error);
      try {
        if (interaction && (interaction.replied || interaction.deferred)) {
          await interaction.editReply({ content: '❌ An unexpected error occurred while processing this interaction.', embeds: [] });
        } else if (interaction && typeof interaction.reply === 'function') {
          await interaction.reply({ content: '❌ An unexpected error occurred while processing this interaction.', flags: 64 });
        }
      } catch {
        // ignore reply errors
      }
    }
  },
};
