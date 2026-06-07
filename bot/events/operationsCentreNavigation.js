module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    // Only handle dashboard page navigation buttons
    if (!interaction.customId.startsWith('dashboard_page_')) return;

    try {
      const client = interaction.client;

      if (!client.operationsCenter) {
        return interaction.reply({
          content: '❌ Operations Centre not initialized',
          ephemeral: true,
        });
      }

      const pageIndex = parseInt(interaction.customId.replace('dashboard_page_', ''), 10);

      // Validate page index
      if (isNaN(pageIndex) || pageIndex < 0 || pageIndex >= client.operationsCenter.getPageCount()) {
        return interaction.reply({
          content: '❌ Invalid page number',
          ephemeral: true,
        });
      }

      // Change the page
      const changed = await client.operationsCenter.changePage(pageIndex);
      if (!changed) {
        return interaction.reply({
          content: '❌ Failed to change page',
          ephemeral: true,
        });
      }

      // Build the page embed
      const pageEmbed = await client.operationsCenter.buildPage(pageIndex, client);
      const navigationButtons = client.operationsCenter.getNavigationButtons(pageIndex);

      // Update the message
      await interaction.update({
        embeds: [pageEmbed],
        components: navigationButtons,
      }).catch((err) => {
        console.error('[Operations Centre] Error updating page:', err.message);
      });

      client.operationsCenter.logActivity(`📄 Page switched to ${pageIndex}`);
    } catch (error) {
      console.error('[Operations Centre] Error handling dashboard navigation:', error);
      try {
        interaction.reply({
          content: `❌ Error updating page: ${error.message}`,
          ephemeral: true,
        });
      } catch (replyErr) {
        // Silently fail if reply fails
      }
    }
  },
};
