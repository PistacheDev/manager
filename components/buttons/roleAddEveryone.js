const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports =
{
    name: 'roleAddEveryoneButton',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId('roleAddEveryoneModal')
            .setTitle('Role to give:')

            const modalOption = new TextInputBuilder()
            .setCustomId('roleAddEveryoneModalOption')
            .setLabel('Role ID:')
            .setPlaceholder('Role to attribute to everyone.')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

            const modalInput = new ActionRowBuilder()
            .addComponents(modalOption)

            modal.addComponents(modalInput);
            await interaction.showModal(modal);
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] roleAddEveryoneButton, ${err}, ${Date.now()}`);
        };
    }
};