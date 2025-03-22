const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "autoraidmodeButton",
    ownerOnly: true,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;
            if (config.length < 1) data = await fixMissingConfig(guild);

            if (data[0].autoraidmode == 0)
            {
                const modal = new ModalBuilder()
                .setCustomId("autoraidmodeModal")
                .setTitle("Setup the auto raidmode:")

                const option = new TextInputBuilder()
                .setCustomId("option")
                .setLabel("What is the maximum number of messages?")
                .setPlaceholder("Maximum of new members during the interval (3 ~ 10).")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)

                const input = new ActionRowBuilder()
                .addComponents(option)

                const option2 = new TextInputBuilder()
                .setCustomId("option2")
                .setLabel("What's the interval of time studied?")
                .setPlaceholder("Interval of time in second (3 ~ 10).")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)

                const input2 = new ActionRowBuilder()
                .addComponents(option2)

                modal.addComponents(input, input2);
                await interaction.showModal(modal);
                return;
            };

            const raidmode = data[0].raidmode;
            const antibots = data[0].antibots;

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
            .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
            .addFields([{ name: ":closed_lock_with_key:・Raidmode:", value: `➜ ${raidmode == 1 ? ":green_circle:" : ":red_circle:"} Blocks the arrival of **new members** on the server.` }])
            .addFields([{ name: ":crossed_swords:・Auto raidmode:", value: "➜ :red_circle: Enable the **raidmode** when **too many users** join the server in a **short period** of time." }])
            .addFields([{ name: ":robot:・Anti bots:", value: `➜ ${antibots == 1 ? ":green_circle:" : ":red_circle:"} Blocks the **addition of applications**, except if it has been added by the **server owner**.` }])
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            interaction.message.edit({ embeds: [embed] });
            interaction.deferUpdate();

            db.query("UPDATE config SET autoraidmode = ? WHERE guild = ?", [0, guild.id], async (err) =>
            {
                if (err) throw err;
            });
        });
    }
};