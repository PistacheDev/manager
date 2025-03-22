const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");
const { configMenu } = require("../prefabs/configMenu");

module.exports =
{
    name: "xpGoalsBackButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        var menu = configMenu();

        var buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId("xpSettingsButton")
            .setEmoji("⚙️")
            .setStyle(ButtonStyle.Secondary)
        ).addComponents(
            new ButtonBuilder()
            .setCustomId("xpGoalsButton")
            .setEmoji("🏆")
            .setStyle(ButtonStyle.Secondary)
        );

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;
            if (config.length < 1) data = await fixMissingConfig(guild);

            const xp = data[0].xp;
            let goals = 0;

            for (let i = 0; i < 10; i++)
            {
                const goal = data[0].xpgoals.split(" ")[i];
                if (goal == 0) goals++;
            };

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
            .setThumbnail(client.user.avatarURL())
            .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
            .addFields([{ name: ":gear:・XP system:", value: `➜ ${xp == 0 ? ":red_circle:" : ":green_circle:"} Gives XP points to the members per **each message sent**, **between 1** and **${xp == 0 ? "the maximum amount of XP points configured" : `${xp.split(" ")[1]} XP points`}**. Each time the members pass the **goal to level up**, their level **increases by 1**. The maximum level is **${xp == 0 ? "the configured level" : `the level ${xp.split(" ")[2]}`}**. The members **${xp == 0 ? "can be" : xp.split(" ")[0] == 1 ? "are" : "aren't"} notified** when they level up.` }])
            .addFields([{ name: ":trophy:・Goals:", value: `➜ ${xp == 0 ? ":red_circle:" : goals == 10 ? ":yellow_circle:" : ":green_circle:"} When a member **reaches a certain level**, the application **gives a role** to this member. Yet, **${goals == 10 ? "no roles have been configured" : `it remains ${goals} roles configurable available`}**.` }])
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            interaction.deferUpdate();
        });
    }
};