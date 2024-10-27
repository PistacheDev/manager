const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports =
{
    name: 'xpGoalsButton',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId('xpGoalsModal')
            .setTitle('Goals setup:')

            const modalOption = new TextInputBuilder()
            .setCustomId('xpGoalsModalOption')
            .setLabel('Targeted goal:')
            .setPlaceholder('Targeted goal (1 ~ 4).')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

            const modalInput = new ActionRowBuilder()
            .addComponents(modalOption)

            const modalOption2 = new TextInputBuilder()
            .setCustomId('xpGoalsModalOption2')
            .setLabel('Level:')
            .setPlaceholder('Level to reach to get the role (10 ~ 100).')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

            const modalInput2 = new ActionRowBuilder()
            .addComponents(modalOption2)

            const modalOption3 = new TextInputBuilder()
            .setCustomId('xpGoalsModalOption3')
            .setLabel('Role ID:')
            .setPlaceholder('To disable this goal, let this field empty.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)

            const modalInput3 = new ActionRowBuilder()
            .addComponents(modalOption3)

            modal.addComponents(modalInput, modalInput2, modalInput3);
            await interaction.showModal(modal);
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] xpGoalsButton, ${err}, ${Date.now()}`);
        };
    }
};