const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "antipingsModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const ignoreBots = interaction.fields.getTextInputValue("option1");
            const sanction = interaction.fields.getTextInputValue("option2");
            const guild = interaction.guild;

            if (ignoreBots != "yes" && ignoreBots != "no") return interaction.reply({ content: ":warning: Your answer for the `ignore bots` option is invalid!", flags: MessageFlags.Ephemeral });
            if (sanction != "ban" && isNaN(sanction)) return interaction.reply({ content: ":warning: Please, enter a number or \"ban\" for the sanction!", flags: MessageFlags.Ephemeral });
            if (sanction != "ban" && (sanction < 1 || sanction > 70560)) return interaction.reply({ content: ":warning: The mute can't last less than 1 minute or longer than 7 days (70560)!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const antispam = data[0].antispam;
                const antiswear = data[0].antiswear;
                const warn = data[0].warn;
                const antilinks = data[0].antilinks;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":hand_splayed:・Anti spam:", value: `➜ ${antispam == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from sending **${antispam == 0 ? "too many messages" : `more than ${antispam.split(" ")[1]} messages`}** in **${antispam == 0 ? "a short period of time" : `less than ${antispam.split(" ")[2]} seconds`}** by warning them. After **${antispam == 0 ? "the maximum configured amount of" : antispam.split(" ")[3]} warns** reached, the member will **${antispam == 0 ? "receive a sanction" : `be ${antispam.split(" ")[4] == "ban" ? "banned" : `muted for ${antispam.split(" ")[4]} minutes`}`}**. The bots **${antispam == 0 ? "can be ignored (*not recommended*)" : `${antispam.split(" ")[0] == 0 ? "aren't ignored" : "are ignored"}`}**.` }])
                .addFields([{ name: ":no_entry:・Anti swear:", value: `➜ ${antiswear == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using bad words** by warning them. After **${antiswear == 0 ? "the maximum configured amount of" : antiswear.split(" ")[2]} warns** reached, the member will **${antiswear == 0 ? "receive a sanction" : `be ${antiswear.split(" ")[3] == "ban" ? "banned" : `muted for ${antiswear.split(" ")[3]} minutes`}`}**. The bots **${antiswear == 0 ? "can be" : antiswear.split(" ")[0] == 0 ? "aren't" : "are"} ignored** and the administrators **${antiswear == 0 ? "too" : antiswear.split(" ")[1] == 0 ? "aren't ignored" : "are ignored"}**.` }])
                .addFields([{ name: ":warning:・Warns:", value: `➜ ${warn == 0 ? ":red_circle:" : ":green_circle:"} The member **will be ${warn == 0 ? "sanctionned" : warn.split(" ")[1] == "ban" ? "banned" : `muted for ${warn.split(" ")[1]} hours`}** if its warns count reaches **${warn == 0 ? "the maximum amount" : `more than ${warn.split(" ")[0]} warns`}**.` }])
                .addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ :green_circle: Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${sanction == "ban" ? "banning them" : `muting them for ${sanction} minutes`}**. The bots **${ignoreBots == 0 ? "aren't ignored" : "are ignored"}**.` }])
                .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":red_circle:" : antilinks == 1 ? ":yellow_circle:" : ":green_circle:"} Delete the messages **containing links**. The bots ${antilinks == 0 ? "can be" : antilinks == 1 ? "are" : "aren't"} ignored.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query("UPDATE config SET antipings = ? WHERE guild = ?", [`${ignoreBots == "yes" ? 1 : 0} ${sanction}`, guild.id], async (err) =>
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