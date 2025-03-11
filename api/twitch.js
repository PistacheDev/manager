const { db, client } = require("../main");
const axios = require("axios");
const cheerio = require("cheerio");
const { EmbedBuilder } = require("discord.js");

async function twitchNotifications()
{
    db.query("SELECT * FROM config", async (err, data) =>
    {
        if (err) throw err;

        for (let i = 0; i < data.length; i++)
        {
            try
            {
                if (data[i].twitch == 0) continue; // The option is turned off for this server.
                const [channelID, roleID, twitchID, wasLive, check] = data[i].twitch.split(" ");
                if (roleID == 0 || channelID == 0) continue; // The configuration isn't finished for this server.

                setTimeout(() => {}, 500); // Wait to avoid too many requests.
                const channel = await axios.get(`https://www.twitch.tv/${twitchID}`);
                const html = cheerio.load(channel.data).html();
                const isLive = /isLiveBroadcast/.test(html) ? 1 : 0; // Fetch if the channel's live or not.

                if (parseInt(wasLive) != isLive)
                {
                    if (isLive == 0 && parseInt(check) < 3) // Check 3 times that the channel is offline to ensure that the info is correct to avoid mass pings.
                    {
                        db.query("UPDATE config SET twitch = ? WHERE guild = ?", [`${channelID} ${roleID} ${twitchID} ${wasLive} ${parseInt(check) + 1}`, data[i].guild], async (err) =>
                        {
                            if (err) throw err;
                        });

                        return;
                    };

                    db.query("UPDATE config SET twitch = ? WHERE guild = ?", [`${channelID} ${roleID} ${twitchID} ${isLive} 0`, data[i].guild], async (err) =>
                    {
                        if (err) throw err;
                        if (isLive == 1)
                        {
                            // Fetch the required info.
                            const channelIcon = html.match(/<meta property="og:image" content="([^"]+)"/)[1];
                            const title = html.match(/<meta name="description" content="([^"]+)"/)[1];
                            const thumbnail = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchID}-640x360.jpg`;

                            const embed = new EmbedBuilder()
                            .setColor("Purple")
                            .setURL(`https://www.twitch.tv/${twitchID}`)
                            .setTitle(title)
                            .setDescription(`[Livestream](https://www.twitch.tv/${twitchID})\n[Channel's icon](${channelIcon})\n[Thumbnail](${thumbnail})`)
                            .setThumbnail(channelIcon)
                            .setImage(thumbnail)
                            .setTimestamp()
                            .setFooter({ text: twitchID, iconURL: channelIcon })

                            client.channels.cache.get(channelID).send({ content: `[${twitchID}](https://www.twitch.tv/${twitchID}) is now **live**! ||${roleID == "@everyone" ? "@everyone" : `<@&${roleID}>`}||`, embeds: [embed] });
                        };
                    });
                };
            }
            catch (err)
            {
                console.error(`[error] api, twitch, ${err}, ${data[i].guild}, ${Date.now()}`);
                continue;
            };
        };
    });
};

module.exports =
{
    twitchNotifications
};