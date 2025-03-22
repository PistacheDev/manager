const { EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "raidmodeButton",
    ownerOnly: true,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;
            if (config.length < 1) data = await fixMissingConfig(guild);

            const raidmode = data[0].raidmode;
            const auto = data[0].autoraidmode;
            const antibots = data[0].antibots;

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
            .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
            .addFields([{ name: ":closed_lock_with_key:・Raidmode:", value: `➜ ${raidmode == 1 ? ":red_circle:" : ":green_circle:"} Blocks the arrival of **new members** on the server.` }])
            .addFields([{ name: ":crossed_swords:・Auto raidmode:", value: `➜ ${auto != 0 ? ":green_circle:" : ":red_circle:"} Enable the **raidmode** when **${auto == 0 ? "too many users" : `more than ${auto.split(" ")[0]} users`}** join the server in ${auto == 0 ? "a **short period** of time" : `less than **${auto.split(" ")[1]} seconds**`}.` }])
            .addFields([{ name: ":robot:・Anti bots:", value: `➜ ${antibots == 1 ? ":green_circle:" : ":red_circle:"} Blocks the **addition of applications**, except if it has been added by the **server owner**.` }])
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() });

            interaction.message.edit({ embeds: [embed] });
            interaction.deferUpdate();

            db.query("UPDATE config SET raidmode = ? WHERE guild = ?", [raidmode == 1 ? 0 : 1, guild.id], async (err) =>
            {
                if (err) throw err;
            });
        });
    }
};