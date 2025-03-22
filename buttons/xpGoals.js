const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "xpGoalsButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        db.query("SELECT * FROM config WHERE guild = ?", [interaction.guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;
            if (config.length < 1) data = await fixMissingConfig(guild);

            let embed = new EmbedBuilder().setColor("Orange")
            let count = 0;

            for (let i = 0; i < 10; i++)
            {
                const goal = data[0].xpgoals.split(" ")[i];
                if (goal == 0) continue;

                count++;
                embed.addFields({ name: `**Goal ${count}/10**:`, value: `➜ Gives the **role <@&${goal.split("-")[1]}>** when the members reach the **level ${goal.split("-")[0]}**.` })
            };

            var buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("xpGoalsCreateButton")
                .setLabel("Create a goal")
                .setStyle(ButtonStyle.Secondary)
            ).addComponents(
                new ButtonBuilder()
                .setCustomId("xpGoalsRemoveButton")
                .setLabel("Remove a goal")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(count == 0)
            ).addComponents(
                new ButtonBuilder()
                .setCustomId("xpGoalsBackButton")
                .setLabel("Back")
                .setStyle(ButtonStyle.Danger)
            );

            if (count == 0) embed.setDescription(":warning: No goal has been configured yet. Press the \"Create a goal\" button to get started.");
            await interaction.message.edit({ embeds: [embed], components: [buttons] });
            interaction.deferUpdate();
        });
    }
};