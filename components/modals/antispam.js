const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "antispamModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const maxMessages = interaction.fields.getTextInputValue("option");
            const interval = interaction.fields.getTextInputValue("option2");
            const maxWarns = interaction.fields.getTextInputValue("option3");
            const sanction = interaction.fields.getTextInputValue("option4");
            const guild = interaction.guild;

            if (isNaN(maxMessages) || isNaN(interval) || isNaN(maxWarns) || (sanction != "ban" && isNaN(sanction))) return interaction.reply({ content: ":warning: Please! Enter a number!", flags: MessageFlags.Ephemeral });
            if (maxMessages < 2 || maxMessages > 10) return interaction.reply({ content: ":warning: The maximum messages must be between 2 and 10 messages!", flags: MessageFlags.Ephemeral });
            if (interval < 2 || interval > 10) return interaction.reply({ content: ":warning: The interval must be between 2 and 10 seconds!", flags: MessageFlags.Ephemeral });
            if (maxWarns < 1 || maxWarns > 5) return interaction.reply({ content: ":warning: The maximum warns must be between 1 and 5 warns!", flags: MessageFlags.Ephemeral });
            if (sanction != "ban" && (sanction < 1 || sanction > 70560)) return interaction.reply({ content: ":warning: The mute can't last less than 1 minute or longer than 7 days (70560)!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const antiswear = data[0].antiswear;
                const warn = data[0].warn;
                const antipings = data[0].antipings;
                const antilinks = data[0].antilinks;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":hand_splayed:・Anti spam:", value: `➜ :green_circle: Prevent the members from sending **more than ${maxMessages} messages** in **less than ${interval} seconds** by warning them. After **${maxWarns} warns** reached, the member will **be ${sanction == "ban" ? "banned" : `muted for ${sanction} minutes`}**.` }])
                .addFields([{ name: ":no_entry:・Anti swear:", value: `➜ ${antiswear == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using bad words** by warning them. After **${antiswear == 0 ? "the maximum configured amount of" : antiswear.split(" ")[0]} warns** reached, the member will **${antiswear == 0 ? "receive a sanction" : `be ${antiswear.split(" ")[1] == "ban" ? "banned" : `muted for ${antiswear.split(" ")[1]} minutes`}`}**.` }])
                .addFields([{ name: ":warning:・Warns:", value: `➜ ${warn == 0 ? ":red_circle:" : ":green_circle:"} The member **will be ${warn == 0 ? "sanctionned" : warn.split(" ")[1] == "ban" ? "banned" : `muted for ${warn.split(" ")[1]} hours`}** if its warns count reaches **${warn == 0 ? "the maximum amount" : `more than ${warn.split(" ")[0]} warns`}**.` }])
                .addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ ${antipings == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${antipings == 0 ? "sanctioning them" : antipings == "ban" ? "banning them" : `muting them for ${antipings} minutes`}**.` }])
                .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":red_circle:" : ":green_circle:"} Delete the messages **containing links**.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();
        
                db.query("UPDATE config SET antispam = ? WHERE guild = ?", [`${maxMessages} ${interval} ${maxWarns} ${sanction}`, guild.id], async (err) =>
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