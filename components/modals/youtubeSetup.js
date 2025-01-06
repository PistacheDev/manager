const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
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
            const roleID = interaction.fields.getTextInputValue("option1");
            const channelURL = interaction.fields.getTextInputValue("option2");
            const guild = interaction.guild;

            if (roleID != "@everyone" && !guild.roles.cache.get(roleID)) return interaction.reply({ content: ":warning: This role doesn't exist!", flags: MessageFlags.Ephemeral });
            let request;

            try
            {
                request = await axios.get(`${channelURL}/videos`)
            }
            catch (err)
            {
                interaction.reply({ content: ":warning: This YouTube channel doesn't exist!", flags: MessageFlags.Ephemeral });
                console.error(`[error] ${this.name}, request, ${err}, ${Date.now()}`);
                return;
            };

            const html = cheerio.load(request.data).html();
            const regex = /"webCommandMetadata":{"url":"\/watch\?v=([^"]+)"/;
            const latestVideoID = `${html.match(regex) ? html.match(regex)[1] : 0}`;
            const youtubeID = html.match(/"channelUrl":"([^"]+)"/)[1].split("channel/")[1];

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const channelID = data[0].youtube.split(" ")[0];
                const twitch = data[0].twitch;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":video_camera:・YouTube Notifications:", value: `➜ :green_circle: **Sends a message** in <#${channelID}> mentioning ${roleID == "@everyone" ? "@everyone" : `<@&${roleID}>`} when ${youtubeID} releases a **new video**.` }])
                .addFields([{ name: ":television:・Twitch Notifications:", value: `➜ ${twitch == 0 ? ":red_circle:" : twitch.split(" ")[1] == 0 ? ":yellow_circle:" : ":green_circle:"} **Sends a message** in ${twitch == 0 ? "the **configured channel**" : `<#${twitch.split(" ")[0]}>`} mentioning ${twitch == 0 ? "the **configured role**" : twitch.split(" ")[1] == 0 ? "the **future role** (setup to complete)" : twitch.split(" ")[1] == "@everyone" ? "@everyone" : `<@&${twitch.split(" ")[1]}>`} when ${twitch == 0 ? "the **configured Twitch channel**" : twitch.split(" ")[1] == 0 ? "the **future Twitch channel**" : `**${twitch.split(" ")[2]}**`} goes to **live**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query("UPDATE config SET youtube = ? WHERE guild = ?", [`${channelID} ${roleID} ${youtubeID} ${latestVideoID} 0`, guild.id], async (err) =>
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