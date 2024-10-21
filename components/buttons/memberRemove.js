const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports =
{
    name: 'memberRemoveButton',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId('memberRemoveModal')
            .setTitle('Setup the channel:')

            const modalOption = new TextInputBuilder()
            .setCustomId('memberRemoveModalOption')
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
            console.error(`[error] memberRemoveButton, ${err}, ${Date.now()}`);
        };
    }
};