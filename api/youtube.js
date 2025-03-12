const axios = require("axios");
const cheerio = require("cheerio");
const { db, client } = require("../main");
const { EmbedBuilder } = require("discord.js");

async function youtubeNotifications()
{
    db.query("SELECT * FROM config", async (err, data) =>
    {
        if (err) throw err;

        for (let i = 0; i < data.length; i++)
        {
            try
            {
                if (data[i].youtube == 0) continue; // The option is turned off for this server.
                const [channelID, roleID, youtubeID, videoID, previousID] = data[i].youtube.split(" ");
                if (roleID == 0 || youtubeID == 0) continue; // The configuration isn't finished for this server.

                setTimeout(() => {}, 500); // Wait to avoid too many requests.
                const videos = await axios.get(`https://www.youtube.com/channel/${youtubeID}/videos`);
                const html = cheerio.load(videos.data).html(); // Convert the data in HTML.
                const regex = /"webCommandMetadata":{"url":"\/watch\?v=([^"]+)"/;
                const latestID = `${html.match(regex) ? html.match(regex)[1] : 0}`;
                const thumbnail = html.match(/"thumbnail":\{"thumbnails":\[\{"url":"https:\/\/i\.ytimg\.com\/vi\/([^"]+)"/)[1];

                if (latestID == videoID && latestID != 0 && latestID == previousID)
                {
                    setTimeout(() => {}, 500);
                    const video = await axios.get(`https://www.youtube.com/watch?v=${latestID}`);
                    const html = cheerio.load(video.data).html(); // Convert the data in HTML.

                    // Fetch required information.
                    let videoTitle = html.match(/"title":{"runs":\[\{"text":"([^"]+)"\}\]/)[1];
                    const channelName = html.match(/"channel":{"simpleText":"([^"]+)"}/)[1];
                    const channelIcon = html.match(/"thumbnails":\[\{"url":"https:\/\/yt3.ggpht.com\/([^"]+)"\}\]/)[1];
                    const descriptionMatch = html.match(/"attributedDescription":{"content":"([^"]+)"/);
                    const fullVideoDescription = descriptionMatch ? descriptionMatch[1] : "No description available for this video.";
                    let videoDescription = fullVideoDescription.replace(/\\n/g, " ");

                    // Reduce some data length if they are too long for the embed.
                    if (videoTitle.length > 40) videoTitle = `${videoTitle.slice(0, 37)}...`;
                    if (videoDescription.length > 140) videoDescription = `${videoDescription.slice(0, 137)}...`;

                    const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setURL(`https://www.youtube.com/watch?v=${latestID}`)
                    .setTitle(videoTitle)
                    .setThumbnail(`https://yt3.ggpht.com/${channelIcon}`)
                    .setDescription(videoDescription)
                    .setImage(`https://i.ytimg.com/vi/${thumbnail}`)
                    .setTimestamp()
                    .setFooter({ text: channelName, iconURL: `https://yt3.ggpht.com/${channelIcon}` })

                    db.query("UPDATE config SET youtube = ? WHERE guild = ?", [`${channelID} ${roleID} ${youtubeID} ${latestID} ${videoID}`, data[i].guild], async (err) =>
                    {
                        if (err) throw err;
                        client.channels.cache.get(channelID).send({ content: `[${channelName}](https://www.youtube.com/channel/${youtubeID}) uploaded a [new video](https://www.youtube.com/watch?v=${latestID})! ||${roleID == "@everyone" ? "@everyone" : `<@&${roleID}>`}||`, embeds: [embed] });
                    });
                };
            }
            catch (err)
            {
                console.error(`[error] api, youtube, ${err}, ${data[i].guild}, ${Date.now()}`);
                continue;
            };
        };
    });
};

module.exports =
{
    youtubeNotifications
};