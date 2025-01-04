const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports =
{
    name: "roleAddHumansButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId("roleAddHumansModal")
            .setTitle("Role to give:")

            const option = new TextInputBuilder()
            .setCustomId("option")
            .setLabel("Role ID:")
            .setPlaceholder("Role to attribute to humans.")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

            const input = new ActionRowBuilder()
            .addComponents(option)

            modal.addComponents(input);
            await interaction.showModal(modal);
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};