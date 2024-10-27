const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports =
{
    name: 'joinRoleButton',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId('joinRoleModal')
            .setTitle('Setup the role:')

            const modalOption = new TextInputBuilder()
            .setCustomId('joinRoleModalOption')
            .setLabel('Role ID:')
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
            console.error(`[error] joinRoleButton, ${err}, ${Date.now()}`);
        };
    }
};