const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports =
{
    name: "memberAddButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId("memberAddModal")
            .setTitle("Setup the channel:")

            const modalOption = new TextInputBuilder()
            .setCustomId("memberAddModalOption")
            .setLabel("Channel ID:")
            .setPlaceholder("To disable this option, let this field empty.")
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
            console.error(`[error] memberAddButton, ${err}, ${Date.now()}`);
        };
    }
};