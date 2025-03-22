const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "warnModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const maxWarns = interaction.fields.getTextInputValue("option");
        const sanction = interaction.fields.getTextInputValue("option2");
        const guild = interaction.guild;

        if (isNaN(maxWarns) || (sanction != "ban" && isNaN(sanction))) return interaction.reply({ content: ":warning: Please! Enter a number!", flags: MessageFlags.Ephemeral });
        if (maxWarns < 2 || maxWarns > 10) return interaction.reply({ content: ":warning: The maximum warns count must be between 2 and 10 warns!", flags: MessageFlags.Ephemeral });
        if (sanction != "ban" && (sanction < 1 || sanction > 168)) return interaction.reply({ content: ":warning: The mute can't last less than 1 hour or longer than 7 days (*168*)!", flags: MessageFlags.Ephemeral });

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;
            if (config.length < 1) data = await fixMissingConfig(guild);

            const antispam = data[0].antispam;
            const antiswear = data[0].antiswear;
            const antipings = data[0].antipings;
            const antilinks = data[0].antilinks;

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
            .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
            .addFields([{ name: ":hand_splayed:・Anti spam:", value: `➜ ${antispam == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from sending **${antispam == 0 ? "too many messages" : `more than ${antispam.split(" ")[0]} messages`}** in **${antispam == 0 ? "a short period of time" : `less than ${antispam.split(" ")[1]} seconds`}** by warning them. After **${antispam == 0 ? "the maximum configured amount of" : antispam.split(" ")[2]} warns** reached, the member will **${antispam == 0 ? "receive a sanction" : `be ${antispam.split(" ")[3] == "ban" ? "banned" : `muted for ${antispam.split(" ")[3]} minutes`}`}**.` }])
            .addFields([{ name: ":no_entry:・Anti swear:", value: `➜ ${antiswear == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using bad words** by warning them. After **${antiswear == 0 ? "the maximum configured amount of" : antiswear.split(" ")[0]} warns** reached, the member will **${antiswear == 0 ? "receive a sanction" : `be ${antiswear.split(" ")[1] == "ban" ? "banned" : `muted for ${antiswear.split(" ")[1]} minutes`}`}**.` }])
            .addFields([{ name: ":warning:・Warns:", value: `➜ :green_circle: The member **will be ${sanction == "ban" ? "banned" : `muted for ${sanction} hours`}** if its warns count reaches **more than ${maxWarns} warns**.` }])
            .addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ ${antipings == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${antipings == 0 ? "sanctioning them" : antipings == "ban" ? "banning them" : `muting them for ${antipings} minutes`}**.` }])
            .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":red_circle:" : ":green_circle:"} Delete the messages **containing links**.` }])
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            interaction.message.edit({ embeds: [embed] });
            interaction.deferUpdate();

            db.query("UPDATE config SET warn = ? WHERE guild = ?", [`${maxWarns} ${sanction}`, guild.id], async (err) =>
            {
                if (err) throw err;
            });
        });
    }
};