const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports =
{
    name: "xpGoalsSetupButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const modal = new ModalBuilder()
            .setCustomId("xpGoalsSetupModal")
            .setTitle("Goals setup:")

            const option1 = new TextInputBuilder()
            .setCustomId("option1")
            .setLabel("What's the goal's number?")
            .setPlaceholder("Targeted goal (1 ~ 10).")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

            const input1 = new ActionRowBuilder()
            .addComponents(option1)

            const option2 = new TextInputBuilder()
            .setCustomId("option2")
            .setLabel("What's the level to reach?")
            .setPlaceholder("Level to reach to get the role (10 ~ 100).")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

            const input2 = new ActionRowBuilder()
            .addComponents(option2)

            const option3 = new TextInputBuilder()
            .setCustomId("option3")
            .setLabel("What role I have to attribute? (Role ID)")
            .setPlaceholder("To disable this goal, let this field empty.")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)

            const input3 = new ActionRowBuilder()
            .addComponents(option3)

            modal.addComponents(input1, input2, input3);
            await interaction.showModal(modal);
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};