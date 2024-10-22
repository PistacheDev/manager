const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports =
{
    name: 'messagesLogsButton',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId('messagesLogsModal')
            .setTitle('Setup the channel:')

            const modalOption = new TextInputBuilder()
            .setCustomId('messagesLogsModalOption')
            .setLabel('Channel ID:')
            .setPlaceholder('To disable this option, let this field empty')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)

            const modalInput = new ActionRowBuilder()
            .addComponents(modalOption)

            modal.addComponents(modalInput);
            await interaction.showModal(modal);
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] messagesLogsButton, ${err}, ${Date.now()}`);
        };
    }
};