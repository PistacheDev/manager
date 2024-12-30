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

            db.query(`SELECT * FROM config WHERE guild = ?`, [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                if (data[0].antiswear == 0)
                {
                    const modal = new ModalBuilder()
                    .setCustomId("antiswearModal")
                    .setTitle("Setup the anti swear:")

                    const modalOption = new TextInputBuilder()
                    .setCustomId("antiswearModalOption")
                    .setLabel("Ignore Bots:")
                    .setPlaceholder("Answer by \"yes\" or \"no\".")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput = new ActionRowBuilder()
                    .addComponents(modalOption)

                    const modalOption2 = new TextInputBuilder()
                    .setCustomId("antiswearModalOption2")
                    .setLabel("Ignore Administrators:")
                    .setPlaceholder("Answer by \"yes\" or \"no\".")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput2 = new ActionRowBuilder()
                    .addComponents(modalOption2)

                    const modalOption3 = new TextInputBuilder()
                    .setCustomId("antiswearModalOption3")
                    .setLabel("Maximum Warns:")
                    .setPlaceholder("Maximum of warns before the sanction.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput3 = new ActionRowBuilder()
                    .addComponents(modalOption3)

                    const modalOption4 = new TextInputBuilder()
                    .setCustomId("antiswearModalOption4")
                    .setLabel("Sanction:")
                    .setPlaceholder("Enter \"ban\" to ban or a number (in minutes) to mute.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput4 = new ActionRowBuilder()
                    .addComponents(modalOption4)

                    modal.addComponents(modalInput, modalInput2, modalInput3, modalInput4);
                    await interaction.showModal(modal);
                }
                else
                {
                    let spamStatus = ":x: Inactive";
                    let warnsStatus = ":x: Inactive";
                    let pingStatus = ":x: Inactive";

                    if (data[0].antispam != 0)
                    {
                        const [ignoreBot, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(" ");
                        spamStatus = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBot == 1 ? "Yes" : "No"}.\n**Spam Detection:** More than ${maxMessages} messages in ${interval} seconds.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == "ban" ? "Ban" : `Mute for ${sanction} minutes`}`;
                    };

                    if (data[0].warn != 0)
                    {
                        const [maxWarns, sanction] = data[0].warn.split(" ");
                        warnsStatus = `:white_check_mark: Active.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == "ban" ? "Ban" : `Mute for ${sanction} hours`}`;
                    };

                    if (data[0].antipings != 0)
                    {
                        const [ignoreBots, sanction] = data[0].antipings.split(" ");
                        pingStatus = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBots == 1 ? "Yes" : "No"}.\n**Sanction**: ${sanction == "ban" ? "Ban" : `Mute for ${sanction} minutes`}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":hand_splayed:・Anti spam:", value: `>>> **Status**: ${spamStatus}.\n**Function**: Prevent the members from **spamming messages**.` }])
                    .addFields([{ name: ":no_entry:・Anti swear:", value: `>>> **Status**: :x: Inactive.\n**Function**: Prevent the members from **using bad words**.` }])
                    .addFields([{ name: ":warning:・Warns:", value: `>>> **Status**: ${warnsStatus}.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])
                    .addFields([{ name: ":loud_sound:・Anti pings:", value: `>>> **Status**: ${pingStatus}.\n**Function**: Prevent the members from using **@everyone and @here**.` }])
                    .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `>>> **Status**: ${data[0].antilinks == 0 ? ":x: Inactive" : data[0].antilinks == 1 ? ":white_check_mark: Active" : ":lock: Enforced (bots too)"}.\n**Function**: Delete messages **containing links**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    db.query("UPDATE config SET antiswear = ? WHERE guild = ?", [0, guild.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.message.edit({ embeds: [embed] });
                        interaction.deferUpdate();
                    });
                };
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] antispamButton, ${err}, ${Date.now()}`);
        };
    }
};