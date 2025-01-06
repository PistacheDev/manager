const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "xpGoalsSetupModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const goal = interaction.fields.getTextInputValue("option1");
            const level = interaction.fields.getTextInputValue("option2")
            const roleID = interaction.fields.getTextInputValue("option3");
            const guild = interaction.guild;

            if (isNaN(goal) || isNaN(level)) return interaction.reply({ content: ":warning: Please, enter a number!", flags: MessageFlags.Ephemeral });
            if (goal < 1 || goal > 4) return interaction.reply({ content: ":warning: The goal must be between 1 and 4!", flags: MessageFlags.Ephemeral });
            if (level < 10 || level > 100) return interaction.reply({ content: ":warning: The level must be between 10 and 100!", flgs: MessageFlags.Ephemeral });
            if (roleID && !guild.roles.cache.get(roleID)) return interaction.reply({ content: ":warning: This role doesn't exist!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);
                if (data[0].xp == 0) return interaction.reply({ content: ":warning: The XP system is disabled for this server!", flags: MessageFlags.Ephemeral });

                const xpGoals = data[0].xpgoals.split(" ");
                xpGoals[goal - 1] = roleID ? `${level}-${roleID}` : 0;

                let embed = new EmbedBuilder()
                .setColor("Orange")

                for (let i = 0; i < 10; i++)
                {
                    const goal = xpGoals[i];
                    embed.addFields({ name: `**Goal ${i + 1}/10**:`, value: `➜ ${goal != 0 ? ":green_circle:" : ":red_circle:"} Gives the **${goal != 0 ? `role <@&${goal.split("-")[1]}>` : "the configured role"}** when the members reach the **${goal != 0 ? `level ${goal.split("-")[0]}` : "the configured level"}**.` })
                };

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query(`UPDATE config SET xpgoals = ? WHERE guild = ?`, [`${xpGoals[0]} ${xpGoals[1]} ${xpGoals[2]} ${xpGoals[3]} ${xpGoals[4]} ${xpGoals[5]} ${xpGoals[6]} ${xpGoals[7]} ${xpGoals[8]} ${xpGoals[9]}`, guild.id], async (err) =>
                {
                    if (err) throw err;
                });
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};