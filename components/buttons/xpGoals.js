const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "xpGoalsButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            var buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("xpGoalsSetupButton")
                .setLabel("Manage a goal")
                .setStyle(ButtonStyle.Secondary)
            ).addComponents(
                new ButtonBuilder()
                .setCustomId("xpGoalsBackButton")
                .setLabel("Back")
                .setStyle(ButtonStyle.Danger)
            )

            db.query("SELECT * FROM config WHERE guild = ?", [interaction.guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                let embed = new EmbedBuilder()
                .setColor("Orange")

                for (let i = 0; i < 10; i++)
                {
                    const goal = data[0].xpgoals.split(" ")[i];
                    embed.addFields({ name: `**Goal ${i + 1}/10**:`, value: `➜ ${goal != 0 ? ":green_circle:" : ":red_circle:"} Gives the **${goal != 0 ? `role <@&${goal.split("-")[1]}>` : "the configured role"}** when the members reach the **${goal != 0 ? `level ${goal.split("-")[0]}` : "the configured level"}**.` })
                };

                await interaction.message.edit({ embeds: [embed], components: [buttons] });
                interaction.deferUpdate();
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};