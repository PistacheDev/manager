const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "antiswearButton",
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

                if (data[0].antiswear == 0)
                {
                    const modal = new ModalBuilder()
                    .setCustomId("antiswearModal")
                    .setTitle("Setup the anti swear:")

                    const option1 = new TextInputBuilder()
                    .setCustomId("option1")
                    .setLabel("Do i have to ignore the bots?")
                    .setPlaceholder("Answer by \"yes\" or \"no\".")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input1 = new ActionRowBuilder()
                    .addComponents(option1)

                    const option2 = new TextInputBuilder()
                    .setCustomId("option2")
                    .setLabel("Do I have to ignore the administrators?")
                    .setPlaceholder("Answer by \"yes\" or \"no\".")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input2 = new ActionRowBuilder()
                    .addComponents(option2)

                    const option3 = new TextInputBuilder()
                    .setCustomId("option3")
                    .setLabel("What is the maximum amount of warnings?")
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

                    modal.addComponents(input1, input2, input3, input4);
                    await interaction.showModal(modal);
                }
                else
                {
                    const antispam = data[0].antispam;
                    const warn = data[0].warn;
                    const antipings = data[0].antipings;
                    const antilinks = data[0].antilinks;

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":hand_splayed:・Anti spam:", value: `➜ ${antispam == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from sending **${antispam == 0 ? "too many messages" : `more than ${antispam.split(" ")[1]} messages`}** in **${antispam == 0 ? "a short period of time" : `less than ${antispam.split(" ")[2]} seconds`}** by warning them. After **${antispam == 0 ? "the maximum configured amount of" : antispam.split(" ")[3]} warns** reached, the member will **${antispam == 0 ? "receive a sanction" : `be ${antispam.split(" ")[4] == "ban" ? "banned" : `muted for ${antispam.split(" ")[4]} minutes`}`}**. The bots **${antispam == 0 ? "can be ignored (*not recommended*)" : `${antispam.split(" ")[0] == 0 ? "aren't ignored" : "are ignored"}`}**.` }])
                    .addFields([{ name: ":no_entry:・Anti swear:", value: "➜ :red_circle: Prevent the members from **using bad words** by warning them. After **the maximum configured amount of warns** reached, the member will **receive a sanction**. The bots **can be ignored** and the administrators **too**." }])
                    .addFields([{ name: ":warning:・Warns:", value: `➜ ${warn == 0 ? ":red_circle:" : ":green_circle:"} The member **will be ${warn == 0 ? "sanctionned" : warn.split(" ")[1] == "ban" ? "banned" : `muted for ${warn.split(" ")[1]} hours`}** if its warns count reaches **${warn == 0 ? "the maximum amount" : `more than ${warn.split(" ")[0]} warns`}**.` }])
                    .addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ ${antipings == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${antipings == 0 ? "sanctioning them" : antipings.split(" ")[1] == "ban" ? "banning them" : `muting them for ${antipings.split(" ")[1]} minutes`}**. The bots **${antipings == 0 ? "can be ignored (*not recommended*)" : antipings.split(" ")[0] == 0 ? "aren't ignored" : "are ignored"}**.` }])
                    .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":red_circle:" : antilinks == 1 ? ":yellow_circle:" : ":green_circle:"} Delete the messages **containing links**. The bots ${antilinks == 0 ? "can be" : antilinks == 1 ? "are" : "aren't"} ignored.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();

                    db.query("UPDATE config SET antiswear = ? WHERE guild = ?", [0, guild.id], async (err) =>
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