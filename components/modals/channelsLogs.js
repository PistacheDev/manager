const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "channelsLogsModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                var newChannel = interaction.fields.getTextInputValue("channelsLogsModalOption");
                let data = config;

                if (config.length < 1) data = await fixMissingConfig(guild);
                if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply(":warning: This channel doesn't exist or the application can't access it!");

                db.query("UPDATE config SET channelsLogs = ? WHERE guild = ?", [newChannel ? newChannel : 0, guild.id], async (err) =>
                {
                    if (err) throw err;

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":speech_balloon:・Messages Logs:", value: `>>> **Status**: ${data[0].messagesLogs == 0 ? ":x: Inactive" : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].messagesLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a message is **deleted** or **edited**.` }])
                    .addFields([{ name: ":keyboard:・Channels Logs:", value: `>>> **Status**: ${!newChannel ? ":x: Inactive" : `:white_check_mark: Active.\n**Configured Channel**: <#${newChannel}>`}.\n**Function**: **Sends a log** in the **configured channel** when a channel is **created**, **deleted**, or **edited**.` }])
                    .addFields([{ name: ":scales:・Bans Logs:", value: `>>> **Status**: ${data[0].bansLogs == 0 ? ":x: Inactive" : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].bansLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a ban is **issued** or **revoked**.` }])
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    await interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] channelsLogsModal, ${err}, ${Date.now()}`);
        };
    }
};