const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "warnButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query(`SELECT * FROM config WHERE guild = ?`, [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                if (data[0].warn == 0)
                {
                    const modal = new ModalBuilder()
                    .setCustomId("warnModal")
                    .setTitle("Setup the anti spam:")

                    const option = new TextInputBuilder()
                    .setCustomId("option")
                    .setLabel("What is the maximum amount of warns?")
                    .setPlaceholder("Maximum number of warns before the sanction (2 ~ 10).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input = new ActionRowBuilder()
                    .addComponents(option)

                    const option2 = new TextInputBuilder()
                    .setCustomId("option2")
                    .setLabel("What sanction I have to apply?")
                    .setPlaceholder("Enter \"ban\" to ban or a number (in hours) to mute.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input2 = new ActionRowBuilder()
                    .addComponents(option2)

                    modal.addComponents(input, input2);
                    await interaction.showModal(modal);
                }
                else
                {
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
                    .addFields([{ name: ":warning:・Warns:", value: "➜ :red_circle: The member **will be sanctionned** if its warns count reaches **the maximum amount**." }])
                    .addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ ${antipings == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${antipings == 0 ? "sanctioning them" : antipings.split(" ")[0] == "ban" ? "banning them" : `muting them for ${antipings.split(" ")[0]} minutes`}**.` }])
                    .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":red_circle:" : ":green_circle:"} Delete the messages **containing links**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();

                    db.query("UPDATE config SET warn = ? WHERE guild = ?", [0, guild.id], async (err) =>
                    {
                        if (err) throw err;
                    });
                };
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};