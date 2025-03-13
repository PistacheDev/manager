const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "xpGoalsCreateButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            db.query("SELECT * FROM config WHERE guild = ?", [interaction.guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                let count = 0;

                for (let i = 0; i < 10; i++)
                {
                    const goal = data[0].xpgoals.split(" ")[i];
                    if (goal != 0) count++;
                };

                if (count == 0) return interaction.reply({ content: ":warning: Every slots are used. Please, empty a slot to continue.", flags: MessageFlags.Ephemeral });
            });

            const modal = new ModalBuilder()
            .setCustomId("xpGoalsCreateModal")
            .setTitle("Goals setup:")

            const option = new TextInputBuilder()
            .setCustomId("option")
            .setLabel("What's the required level to reach?")
            .setPlaceholder("Level to reach to get the role (10 ~ 100).")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

            const input = new ActionRowBuilder()
            .addComponents(option)

            const option2 = new TextInputBuilder()
            .setCustomId("option2")
            .setLabel("What role I have to attribute? (Role ID)")
            .setPlaceholder("Enter the role ID here.")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)

            const input2 = new ActionRowBuilder()
            .addComponents(option2)

            modal.addComponents(input, input2);
            await interaction.showModal(modal);
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};