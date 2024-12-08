const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports =
{
    name: "antispamModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const ignoreBots = interaction.fields.getTextInputValue("antispamModalOption");
            const maxMessages = interaction.fields.getTextInputValue("antispamModalOption2");
            const interval = interaction.fields.getTextInputValue("antispamModalOption3");
            const maxWarns = interaction.fields.getTextInputValue("antispamModalOption4");
            const sanction = interaction.fields.getTextInputValue("antispamModalOption5");
            const guild = interaction.guild;

            if (ignoreBots != "yes" && ignoreBots != "no") return interaction.reply(":warning: Your answer for the **Ignore Bots** option is invalid!");
            if (isNaN(maxMessages) || isNaN(interval) || isNaN(maxWarns) || (sanction != "ban" && isNaN(sanction))) return interaction.reply(":warning: Please! Enter a **number**!");
            if (maxMessages < 1 || maxMessages > 10) return interaction.reply(":warning: The maximum messages must be **between 1 and 10 messages**!");
            if (interval < 1 || interval > 10) return interaction.reply(":warning: The interval must be **between 1 and 10 seconds**!");
            if (maxWarns < 1 || maxWarns > 5) return interaction.reply(":warning: The maximum warns must be **between 1 and 5 warns**!");
            if (sanction != "ban" && (sanction < 1 || sanction > 70560)) return interaction.reply(":warning: The mute can't last **less than 1 minute** or **longer than 7 days (70560)**!");

            db.query("UPDATE config SET antispam = ? WHERE guild = ?", [`${ignoreBots == "yes" ? 1 : 0} ${maxMessages} ${interval} ${maxWarns} ${sanction}`, guild.id], async (err) =>
            {
                if (err) throw err;

                db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
                {
                    if (err) throw err;

                    let warnStatus = ":x: Inactive";
                    let pingStatus = ":x: Inactive";

                    if (data[0].warn != 0) // Update the data if the option is enabled.
                    {
                        const [maxWarns, sanction] = data[0].warn.split(" ");
                        warnStatus = `:white_check_mark: Active.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == "ban" ? "Ban" : `Mute for ${sanction} hours`}`;
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
                    .addFields([{ name: ":hand_splayed:・Anti spam:", value: `>>> **Status**: :white_check_mark: Active.\n**Ignore Bots**: ${ignoreBots == "yes" ? "Yes" : "No"}.\n**Spam Detection:** More than ${maxMessages} messages in ${interval} seconds.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == "ban" ? "Ban" : `Mute for ${sanction} minutes`}.\n**Function**: Prevent the members from **spamming messages**.` }])
                    .addFields([{ name: ":warning:・Warns:", value: `>>> **Status**: ${warnStatus}.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])
                    .addFields([{ name: ":loud_sound:・Anti pings:", value: `>>> **Status**: ${pingStatus}.\n**Function**: Prevent the members from using **@everyone and @here**.` }])
                    .addFields([{ name: ":globe_with_meridians:・Anti links:", value: `>>> **Status**: ${data[0].antilinks == 0 ? ":x: Inactive" : data[0].antilinks == 1 ? ":white_check_mark: Active" : ":lock: Enforced (bots too)"}.\n**Function**: Delete messages **containing links**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] antispamModal, ${err}, ${Date.now()}`);
        };
    }
};