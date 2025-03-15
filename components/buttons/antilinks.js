const { fixMissingConfig } = require("../../functions/missingConfig");
const { EmbedBuilder } = require("discord.js");

module.exports =
{
    name: "antilinksButton",
    ownerOnly: false,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const antispam = data[0].antispam;
                const antiswear = data[0].antiswear;
                const warn = data[0].warn;
                const antipings = data[0].antipings;
                const antilinks = data[0].antilinks;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":hand_splayed:・Anti spam:", value: `➜ ${antispam == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from sending **${antispam == 0 ? "too many messages" : `more than ${antispam.split(" ")[1]} messages`}** in **${antispam == 0 ? "a short period of time" : `less than ${antispam.split(" ")[2]} seconds`}** by warning them. After **${antispam == 0 ? "the maximum configured amount of" : antispam.split(" ")[3]} warns** reached, the member will **${antispam == 0 ? "receive a sanction" : `be ${antispam.split(" ")[4] == "ban" ? "banned" : `muted for ${antispam.split(" ")[4]} minutes`}`}**.` }])
                .addFields([{ name: ":no_entry:・Anti swear:", value: `➜ ${antiswear == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using bad words** by warning them. After **${antiswear == 0 ? "the maximum configured amount of" : antiswear.split(" ")[2]} warns** reached, the member will **${antiswear == 0 ? "receive a sanction" : `be ${antiswear.split(" ")[3] == "ban" ? "banned" : `muted for ${antiswear.split(" ")[3]} minutes`}`}**.` }])
                .addFields([{ name: ":warning:・Warns:", value: `➜ ${warn == 0 ? ":red_circle:" : ":green_circle:"} The member **will be ${warn == 0 ? "sanctionned" : warn.split(" ")[1] == "ban" ? "banned" : `muted for ${warn.split(" ")[1]} hours`}** if its warns count reaches **${warn == 0 ? "the maximum amount" : `more than ${warn.split(" ")[0]} warns`}**.` }])
                .addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ ${antipings == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${antipings == 0 ? "sanctioning them" : antipings == "ban" ? "banning them" : `muting them for ${antipings} minutes`}**.` }])
                .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":green_circle:" : ":red_circle:"} Delete the messages **containing links**.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query("UPDATE config SET antilinks = ? WHERE guild = ?", [antilinks == 0 ? 1 : 0, guild.id], async (err) =>
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