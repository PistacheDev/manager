const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports =
{
    name: "arrivalRoleButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const modal = new ModalBuilder()
        .setCustomId("arrivalRoleModal")
        .setTitle("Setup the role:")

        const option = new TextInputBuilder()
        .setCustomId("option")
        .setLabel("What role I have to attribute? (Role ID)")
        .setPlaceholder("To disable this option, let this field empty.")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)

        const input = new ActionRowBuilder()
        .addComponents(option)

        modal.addComponents(input);
        await interaction.showModal(modal);
    }
};