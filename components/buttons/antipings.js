const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "antipingsButton",
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

                if (data[0].antipings == 0)
                {
                    const modal = new ModalBuilder()
                    .setCustomId("antipingsModal")
                    .setTitle("Setup the anti pings:")

                    const modalOption = new TextInputBuilder()
                    .setCustomId("antipingsModalOption")
                    .setLabel("Ignore Bots:")
                    .setPlaceholder("Answer by \"yes\" or \"no\".")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput = new ActionRowBuilder()
                    .addComponents(modalOption)

                    const modalOption2 = new TextInputBuilder()
                    .setCustomId("antipingsModalOption2")
                    .setLabel("Sanction:")
                    .setPlaceholder("Enter \"ban\" to ban or a number (in minutes) to mute.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput2 = new ActionRowBuilder()
                    .addComponents(modalOption2)

                    modal.addComponents(modalInput, modalInput2);
                    await interaction.showModal(modal);
                }
                else
                {
                    let spamStatus = ":x: Inactive";
                    let swearState = ":x: Inactive";
                    let warnsStatus = ":x: Inactive";

                    if (data[0].antispam != 0)
                    {
                        const [ignoreBot, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(" ");
                        spamStatus = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBot == 1 ? "Yes" : "No"}.\n**Spam Detection:** More than ${maxMessages} messages in ${interval} seconds.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == "ban" ? "Ban" : `Mute for ${sanction} minutes`}`;
                    };

                    if (data[0].antiswear != 0)
                    {
                        const [ignoreBots, ignoreAdmins, maxWarns, sanction] = data[0].antiswear.split(" ");
                        swearState = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBots == 1 ? "Yes" : "No"}.\n**Ignore Administrators**: ${ignoreAdmins == 1 ? "Yes" : "No"}.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == "ban" ? "Ban" : `Mute for ${sanction} minutes`}`;
                    };

                    if (data[0].warn != 0)
                    {
                        const [maxWarns, sanction] = data[0].warn.split(" ");
                        warnsStatus = `:white_check_mark: Active.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == "ban" ? "Ban" : `Mute for ${sanction} hours`}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":hand_splayed:・Anti spam:", value: `>>> **Status**: ${spamStatus}.\n**Function**: Prevent the members from **spamming messages**.` }])
                    .addFields([{ name: ":no_entry:・Anti swear:", value: `>>> **Status**: ${swearState}.\n**Function**: Prevent the members from **using bad words**.` }])
                    .addFields([{ name: ":warning:・Warns:", value: `>>> **Status**: ${warnsStatus}.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])
                    .addFields([{ name: ":loud_sound:・Anti pings:", value: `>>> **Status**: :x: Inactive.\n**Function**: Prevent the members from using **@everyone and @here**.` }])
                    .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `>>> **Status**: ${data[0].antilinks == 0 ? ":x: Inactive" : data[0].antilinks == 1 ? ":white_check_mark: Active" : ":lock: Enforced (bots too)"}.\n**Function**: Delete messages **containing links**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    db.query("UPDATE config SET antipings = ? WHERE guild = ?", [0, guild.id], async (err) =>
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
            console.error(`[error] antipingsButton, ${err}, ${Date.now()}`);
        };
    }
};