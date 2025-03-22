const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "xpSettingsButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;
            if (config.length < 1) data = await fixMissingConfig(guild);

            if (data[0].xp == 0)
            {
                const modal = new ModalBuilder()
                .setCustomId("xpSettingsModal")
                .setTitle("Setup the XP settings:")

                const option = new TextInputBuilder()
                .setCustomId("option")
                .setLabel("Do I notify the members when they level up?")
                .setPlaceholder("Answer by \"yes\" or \"no\".")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)

                const input = new ActionRowBuilder()
                .addComponents(option)

                const option2 = new TextInputBuilder()
                .setCustomId("option2")
                .setLabel("What's the maximum amount of XP?")
                .setPlaceholder("Enter the max amount of XP per message (1 ~ 50).")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)

                const input2 = new ActionRowBuilder()
                .addComponents(option2)

                const option3 = new TextInputBuilder()
                .setCustomId("option3")
                .setLabel("What will be the maximum level?")
                .setPlaceholder("Enter the max level wanted (10 ~ 100).")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)

                const input3 = new ActionRowBuilder()
                .addComponents(option3)

                modal.addComponents(input, input2, input3);
                await interaction.showModal(modal);
            };

            let goals = 0;

            for (let i = 0; i < 10; i++)
            {
                const goal = data[0].xpgoals.split(" ")[i];
                if (goal == 0) goals++;
            };

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
            .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
            .addFields([{ name: ":gear:・XP system:", value: "➜ :red_circle: Gives XP points to the members per **each message sent**, **between 1** and **the maximum amount of XP points configured**. Each time the members pass the **goal to level up**, their level **increases by 1**. The maximum level is **the configured level**. The members **can be notified** when they level up." }])
            .addFields([{ name: ":trophy:・Goals:", value: `➜ :red_circle: When a member **reaches a certain level**, the application **gives a role** to this member. Yet, **${goals == 10 ? "no roles have been configured" : `it remains ${goals} roles configurable available`}**.` }])
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            interaction.message.edit({ embeds: [embed] });
            interaction.deferUpdate();

            db.query("UPDATE config SET xp = ? WHERE guild = ?", [0, guild.id], async (err) =>
            {
                if (err) throw err;
            });
        });
    }
};