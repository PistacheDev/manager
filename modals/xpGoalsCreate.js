const { PermissionsBitField, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "xpGoalsCreateModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const level = interaction.fields.getTextInputValue("option")
        const roleID = interaction.fields.getTextInputValue("option2");
        const guild = interaction.guild;

        if (isNaN(level)) return interaction.reply({ content: ":warning: Please, enter a number for the level option!", flags: MessageFlags.Ephemeral });
        if (level < 10 || level > 100) return interaction.reply({ content: ":warning: The level must be between 10 and 100!", flgs: MessageFlags.Ephemeral });
        if (!guild.roles.cache.get(roleID)) return interaction.reply({ content: ":warning: This role doesn't exist!", flags: MessageFlags.Ephemeral });

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;

            if (config.length < 1) data = await fixMissingConfig(guild);
            if (data[0].xp == 0) return interaction.reply({ content: ":warning: The XP system is disabled for this server!", flags: MessageFlags.Ephemeral });

            const xpGoals = data[0].xpgoals.split(" ");
            let output = -1;

            for (let i = 0; i < 10; i++)
            {
                const goal = xpGoals[i];
                if (goal != 0) continue;

                output = i;
                break;
            };

            if (output == -1) return interaction.reply({ content: ":warning: Every slots are used. Please, empty a slot to continue.", flags: MessageFlags.Ephemeral });
            xpGoals[output] = `${level}-${roleID}`;
            let count = 0;

            let embed = new EmbedBuilder()
            .setColor("Orange")

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
            ).addComponents(
                new ButtonBuilder()
                .setCustomId("xpGoalsBackButton")
                .setLabel("Back")
                .setStyle(ButtonStyle.Danger)
            );

            for (let i = 0; i < 10; i++)
            {
                const goal = xpGoals[i];
                if (goal == 0) continue;

                count++;
                embed.addFields({ name: `**Goal ${count}/10**:`, value: `➜ Gives the **role <@&${goal.split("-")[1]}>** when the members reach the **level ${goal.split("-")[0]}**.` })
            };

            interaction.message.edit({ embeds: [embed], components: [buttons] });
            interaction.deferUpdate();

            db.query(`UPDATE config SET xpgoals = ? WHERE guild = ?`, [`${xpGoals[0]} ${xpGoals[1]} ${xpGoals[2]} ${xpGoals[3]} ${xpGoals[4]} ${xpGoals[5]} ${xpGoals[6]} ${xpGoals[7]} ${xpGoals[8]} ${xpGoals[9]}`, guild.id], async (err) =>
            {
                if (err) throw err;
            });
        });
    }
};