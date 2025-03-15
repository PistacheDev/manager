const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "antispamButton",
    permission: PermissionsBitField.Flags.Administrator,
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

                if (data[0].antispam == 0)
                {
                    const modal = new ModalBuilder()
                    .setCustomId("antispamModal")
                    .setTitle("Setup the anti spam:")

                    const option = new TextInputBuilder()
                    .setCustomId("option")
                    .setLabel("What is the maximum number of messages?")
                    .setPlaceholder("Max number of messages during the interval (2 ~ 10).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input = new ActionRowBuilder()
                    .addComponents(option)

                    const option2 = new TextInputBuilder()
                    .setCustomId("option2")
                    .setLabel("What's the interval of time studied?")
                    .setPlaceholder("Interval of time in seconds (2 ~ 10).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input2 = new ActionRowBuilder()
                    .addComponents(option2)

                    const option3 = new TextInputBuilder()
                    .setCustomId("option3")
                    .setLabel("What's the maximum amount of warnings?")
                    .setPlaceholder("Maximum of warns before the sanction (1 ~ 5).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input3 = new ActionRowBuilder()
                    .addComponents(option3)

                    const option4 = new TextInputBuilder()
                    .setCustomId("option4")
                    .setLabel("What sanction I have to apply?")
                    .setPlaceholder("Enter \"ban\" to ban or a number (in minutes) to mute.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input4 = new ActionRowBuilder()
                    .addComponents(option4)

                    modal.addComponents(input, input2, input3, input4);
                    await interaction.showModal(modal);
                }
                else
                {
                    const antiswear = data[0].antiswear;
                    const warn = data[0].warn;
                    const antipings = data[0].antipings;
                    const antilinks = data[0].antilinks;

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":hand_splayed:・Anti spam:", value: "➜ :red_circle: Prevent the members from sending **too many messages** in **a short period of time** by warning them. After **the maximum configured amount of warns** reached, the member will **receive a sanction**." }])
                    .addFields([{ name: ":no_entry:・Anti swear:", value: `➜ ${antiswear == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using bad words** by warning them. After **${antiswear == 0 ? "the maximum configured amount of" : antiswear.split(" ")[0]} warns** reached, the member will **${antiswear == 0 ? "receive a sanction" : `be ${antiswear.split(" ")[1] == "ban" ? "banned" : `muted for ${antiswear.split(" ")[1]} minutes`}`}**.` }])
                    .addFields([{ name: ":warning:・Warns:", value: `➜ ${warn == 0 ? ":red_circle:" : ":green_circle:"} The member **will be ${warn == 0 ? "sanctionned" : warn.split(" ")[1] == "ban" ? "banned" : `muted for ${warn.split(" ")[1]} hours`}** if its warns count reaches **${warn == 0 ? "the maximum amount" : `more than ${warn.split(" ")[0]} warns`}**.` }])
                    .addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ ${antipings == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${antipings == 0 ? "sanctioning them" : antipings == "ban" ? "banning them" : `muting them for ${antipings} minutes`}**.` }])
                    .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":red_circle:" : ":green_circle:"} Delete the messages **containing links**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();

                    db.query("UPDATE config SET antispam = ? WHERE guild = ?", [0, guild.id], async (err) =>
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