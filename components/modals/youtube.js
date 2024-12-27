const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "youtubeModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                var newChannel = interaction.fields.getTextInputValue("youtubeModalOption");
                let data = config;

                if (config.length < 1) data = fixMissingConfig(guild);
                if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply(":warning: This channel doesn't exist or the application can't access it!");

                db.query("UPDATE config SET youtube = ? WHERE guild = ?", [!newChannel ? 0 : `${newChannel} 0 0 0 0`, guild.id], async (err) =>
                {
                    if (err) throw err;
                    let status = ":x: Inactive";

                    if (data[0].twitch != 0)
                    {
                        const [channelID, roleID, twitchID, isLive] = data[0].twitch.split(" ");
                        status = `:white_check_mark: Active.\n**Configured Channel**: <#${channelID}>.\n**Notification Role**: ${roleID == 0 ? "Awaiting configuration" : roleID == "@everyone" ? "@everyone" : `<@&${roleID}>`}.\n**Twitch Channel**: ${twitchID == 0 ? "Awaiting configuration" : twitchID}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":video_camera:・YouTube Notifications:", value: `>>> **Status**: ${!newChannel ? ":x: Inactive" : `:white_check_mark: Active.\n**Configured Channel**: <#${newChannel}>\n**Notification Role**: Awaiting configuration.\n**YouTube Channel**: Awaiting configuration`}.\n**Function**: **Sends a message** in the **configured channel** when the **configured YouTube channel** releases a **new video**.` }])
                    .addFields([{ name: ":television:・Twitch Notifications:", value: `>>> **Status**: ${status}.\n**Function**: **Sends a message** in the **configured channel** when the **configured Twitch channel** is **live**.` }])
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
            console.error(`[error] youtubeModal, ${err}, ${Date.now()}`);
        };
    }
};