const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports =
{
    name: "youtubeSetupModal",
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
                if (config.length < 1) data = fixMissingConfig(guild);

                const roleID = interaction.fields.getTextInputValue("youtubeModalOption");
                const channelURL = interaction.fields.getTextInputValue("youtubeModalOption2");

                const channelID = data[0].youtube.split(" ")[0];
                if (roleID != "@everyone" && !guild.roles.cache.get(roleID)) return interaction.reply(":warning: This role doesn't exist!");

                const request = await axios.get(`${channelURL}/videos`);
                const html = cheerio.load(request.data).html(); // Convert the data in HTML.

                // Fetch required informations.
                const regex = /"webCommandMetadata":{"url":"\/watch\?v=([^"]+)"/;
                const latestVideoID = `${html.match(regex) ? html.match(regex)[1] : null}`;
                const youtubeID = html.match(/"channelUrl":"([^"]+)"/)[1].split("channel/")[1];

                db.query("UPDATE config SET youtube = ? WHERE guild = ?", [`${channelID} ${roleID} ${youtubeID} ${latestVideoID}`, guild.id], async (err) =>
                {
                    if (err) throw err;
                    let status = ":x: Inactive";

                    if (data[0].twitch != 0)
                    {
                        const [channelID, roleID, twitchID, isLive] = data.twitch.split(" ");
                        status = `:white_check_mark: Active.\n**Configured Channel**: <#${channelID}>.\n**Notification Role**: ${roleID == 0 ? "Awaiting configuration" : roleID == "@everyone" ? "@everyone" : `<@&${roleID}>`}.\n**Twitch Channel**: ${twitchID == 0 ? "Awaiting configuration" : twitchID}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":video_camera:・YouTube Notifications:", value: `>>> **Status**: :white_check_mark: Active.\n**Configured Channel**: <#${channelID}>.\n**Notification Role**: ${roleID == "@everyone" ? "@everyone" : `<@&${roleID}>`}.\n**YouTube Channel**: ${youtubeID}.\n**Function**: **Sends a message** in the **configured channel** when the **configured YouTube channel** releases a **new video**.` }])
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
            console.error(`[error] youtubeSetupModal, ${err}, ${Date.now()}`);
        };
    }
};