const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "antiswearModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const ignoreBots = interaction.fields.getTextInputValue("option1");
            const ignoreAdmins = interaction.fields.getTextInputValue("option2");
            const maxWarns = interaction.fields.getTextInputValue("option3");
            const sanction = interaction.fields.getTextInputValue("option4");
            const guild = interaction.guild;

            if (ignoreBots != "yes" && ignoreBots != "no") return interaction.reply(":warning: Your answer for the **Ignore Bots** option is invalid!");
            if (ignoreAdmins != "yes" && ignoreAdmins != "no") return interaction.reply(":warning: Your answer for the **Ignore Admins** option is invalid!");
            if (sanction != "ban" && isNaN(sanction)) return interaction.reply(":warning: Please! Enter a **number** or \"ban\" for the sanction!");
            if (sanction != "ban" && (sanction < 1 || sanction > 70560)) return interaction.reply(":warning: The mute can't last **less than 1 minute** or **longer than 7 days (70560)**!");
            if (isNaN(maxWarns) || maxWarns < 1 || maxWarns > 5) return interaction.reply(":warning: The maximum warns must be a number **between 1 and 5 warns**!");

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const antispam = data[0].antispam;
                const warn = data[0].warn;
                const antipings = data[0].antipings;
                const antilinks = data[0].antilinks;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":hand_splayed:・Anti spam:", value: `➜ ${antispam == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from sending **${antispam == 0 ? "too many messages" : `more than ${antispam.split(" ")[1]} messages`}** in **${antispam == 0 ? "a short period of time" : `less than ${antispam.split(" ")[2]} seconds`}** by warning them. After **${antispam == 0 ? "the maximum configured amount of" : antispam.split(" ")[3]} warns** reached, the member will **${antispam == 0 ? "receive a sanction" : `be ${antispam.split(" ")[4] == "ban" ? "banned" : `muted for ${antispam.split(" ")[4]} minutes`}`}**. The bots **${antispam == 0 ? "can be ignored (*not recommended*)" : `${antispam.split(" ")[0] == 0 ? "aren't ignored" : "are ignored"}`}**.` }])
                .addFields([{ name: ":no_entry:・Anti swear:", value: `➜ :green_circle: Prevent the members from **using bad words** by warning them. After **${maxWarns} warns** reached, the member will **be ${sanction == "ban" ? "banned" : `muted for ${sanction} minutes`}**. The bots **${ignoreBots == "no" ? "aren't" : "are"} ignored** and the administrators **${ignoreAdmins == "no" ? "aren't ignored" : "are ignored"}**.` }])
                .addFields([{ name: ":warning:・Warns:", value: `➜ ${warn == 0 ? ":red_circle:" : ":green_circle:"} The member **will be ${warn == 0 ? "sanctionned" : warn.split(" ")[1] == "ban" ? "banned" : `muted for ${warn.split(" ")[1]} hours`}** if its warns count reaches **${warn == 0 ? "the maximum amount" : `more than ${warn.split(" ")[0]} warns`}**.` }])
                .addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ ${antipings == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${antipings == 0 ? "sanctioning them" : antipings.split(" ")[1] == "ban" ? "banning them" : `muting them for ${antipings.split(" ")[1]} minutes`}**. The bots **${antipings == 0 ? "can be ignored (*not recommended*)" : antipings.split(" ")[0] == 0 ? "aren't ignored" : "are ignored"}**.` }])
                .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":red_circle:" : antilinks == 1 ? ":yellow_circle:" : ":green_circle:"} Delete the messages **containing links**. The bots ${antilinks == 0 ? "can be" : antilinks == 1 ? "are" : "aren't"} ignored.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });

                db.query("UPDATE config SET antiswear = ? WHERE guild = ?", [`${ignoreBots == "yes" ? 1 : 0} ${ignoreAdmins == "yes" ? 1 : 0} ${maxWarns} ${sanction}`, guild.id], async (err) =>
                {
                    if (err) throw err;
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};