const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports =
{
    name: "memberRemoveButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId("memberRemoveModal")
            .setTitle("Setup the channel:")

            const option = new TextInputBuilder()
            .setCustomId("option")
            .setLabel("Where I have to send them? (Channel ID)")
            .setPlaceholder("To disable this option, let this field empty.")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)

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