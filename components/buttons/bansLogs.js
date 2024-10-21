const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports =
{
    name: 'bansLogsButton',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId('bansLogsModal')
            .setTitle('Setup the channel:')

            const modalOption = new TextInputBuilder()
            .setCustomId('bansLogsModalOption')
            .setLabel('Channel ID:')
            .setPlaceholder('To disable this option, let this field empty.')
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
            console.error(`[error] bansLogsButton, ${err}, ${Date.now()}`);
        };
    }
};