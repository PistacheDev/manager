const { EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "autoraidmodeModal",
    ownerOnly: true,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            const maxMembers = interaction.fields.getTextInputValue("option1");
            const interval = interaction.fields.getTextInputValue("option2");

            if (isNaN(maxMembers) || isNaN(interval)) return interaction.reply(":warning: Please, enter a **number**!");
            if (maxMembers < 3 || maxMembers > 10) return interaction.reply(":warning: The maximum members must be **between 3 and 10**!");
            if (interval < 3 || interval > 10) return interaction.reply(":warning: The interval must be **between 1 and 10 seconds**");

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const raidmode = data[0].raidmode;
                const antibots = data[0].antibots;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":closed_lock_with_key:・Raidmode:", value: `➜ ${raidmode == 1 ? ":green_circle:" : ":red_circle:"} Blocks the arrival of **new members** on the server.` }])
                .addFields([{ name: ":crossed_swords:・Auto raidmode:", value: `➜ :green_circle: Enable the **raidmode** when **more than ${maxMembers} users** join the server in less than **${interval} seconds**.` }])
                .addFields([{ name: ":robot:・Anti bots:", value: `➜ ${antibots == 1 ? ":green_circle:" : ":red_circle:"} Blocks the **addition of applications**, except if it has been added by the **server owner**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });

                db.query("UPDATE config SET autoraidmode = ? WHERE guild = ?", [`${maxMembers} ${interval}`, guild.id], async (err) =>
                {
                    if (err) throw err;
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            console.error(`[error] joinRoleModal, ${err}, ${Date.now()}`);
        };
    }
};