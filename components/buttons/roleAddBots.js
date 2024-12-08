const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports =
{
    name: "roleAddBotsButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId("roleAddBotsModal")
            .setTitle("Role to give:")

            const modalOption = new TextInputBuilder()
            .setCustomId("roleAddBotsModalOption")
            .setLabel("Role ID:")
            .setPlaceholder("Role to attribute to bots.")
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
            console.error(`[error] roleAddBotsButton, ${err}, ${Date.now()}`);
        };
    }
};