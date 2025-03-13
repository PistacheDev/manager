const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports =
{
    name: "xpGoalsRemoveButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId("xpGoalsRemoveModal")
            .setTitle("Goals setup:")

            const option = new TextInputBuilder()
            .setCustomId("option")
            .setLabel("What's the slot number of the goal?")
            .setPlaceholder("Slot number of the goal to remove (1 ~ 10).")
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