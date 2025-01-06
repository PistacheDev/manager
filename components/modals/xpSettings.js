const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "xpSettingsModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const alert = interaction.fields.getTextInputValue("option1");
            const maxXP = interaction.fields.getTextInputValue("option2");
            const maxLevel = interaction.fields.getTextInputValue("option3");
            const guild = interaction.guild;

            if (alert != "yes" && alert != "no") return interaction.reply({ content: ":warning: Your answer for the alert option is invalid!", flags: MessageFlags.Ephemeral });
            if (maxLevel && isNaN(maxXP) && isNaN(maxLevel)) return interaction.reply({ content: ":warning: Please, enter a number!", flags: MessageFlags.Ephemeral });
            if (maxLevel > 100 || maxLevel < 10) return interaction.reply({ content: ":warning: The maximum level must be between 10 and 100!", flags: MessageFlags.Ephemeral });
            if (maxXP > 50 || maxXP < 1) return interaction.reply({ content: ":warning: The maximum amount of XP must be between 1 and 50!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);
                let goals = 0;

                for (let i = 0; i < 10; i++) // Fetch and load every goals.
                {
                    const goal = data[0].xpgoals.split(" ")[i];
                    if (goal == 0) goals++;
                };

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":gear:・XP system:", value: `➜ :green_circle: Gives XP points to the members per **each message sent**, **between 1** and **${maxXP} XP points**. Each time the members pass the **goal to level up**, their level **increases by 1**. The maximum level is **the level ${maxLevel}**. The members **${alert == "yes" ? "are" : "aren't"} notified** when they level up.` }])
                .addFields([{ name: ":trophy:・Goals:", value: `➜ ${goals == 10 ? ":yellow_circle:" : ":green_circle:"} When a member **reaches a certain level**, the application **gives a role** to this member. Yet, **${goals == 10 ? "no roles have been configured" : `it remains ${goals} roles configurable available`}**.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query("UPDATE config SET xp = ? WHERE guild = ?", [`${alert == "yes" ? 1 : 0} ${maxXP} ${maxLevel}`, guild.id], async (err) =>
                {
                    if (err) throw err;
                });    
            });

            db.query("SELECT * FROM xp WHERE guild = ?", [guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return;

                for (let i = 0; i < data.length; i++)
                {
                    const userData = data[i];
                    let currentXP = parseInt(userData.xp);
                    let currentLevel = parseInt(userData.level);

                    if (currentLevel > maxLevel) // If the user level is greater than the new max level.
                    {
                        const difference = currentLevel - maxLevel; // Calculate how many times the loop has to execute.

                        for (let n = 0; n < difference; n++) // Convert the levels in XP points.
                        {
                            currentLevel -= 1;
                            currentXP += 500 + (currentLevel * 10);
                        };

                        db.query("UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?", [currentXP, currentLevel, guild.id, userData.user], async (err) =>
                        {
                            if (err) throw err;
                        });
                    };
                };
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};