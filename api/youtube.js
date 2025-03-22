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
                if (data[i].youtube == 0) continue;
                const [channelID, roleID, youtubeID, videoID, previousID] = data[i].youtube.split(" ");

                setTimeout(() => {}, 500);
                const videos = await axios.get(`https://www.youtube.com/channel/${youtubeID}/videos`);
                const html = cheerio.load(videos.data).html();

                const regex = /"webCommandMetadata":{"url":"\/watch\?v=([^"]+)"/;
                const latestID = `${html.match(regex) ? html.match(regex)[1] : 0}`;
                const thumbnail = html.match(/"thumbnail":\{"thumbnails":\[\{"url":"https:\/\/i\.ytimg\.com\/vi\/([^"]+)"/)[1];

                if (latestID != videoID && latestID != 0 && latestID != previousID)
                {
                    setTimeout(() => {}, 500);
                    const video = await axios.get(`https://www.youtube.com/watch?v=${latestID}`);
                    const html = cheerio.load(video.data).html();

                    const channelName = html.match(/"channel":{"simpleText":"([^"]+)"}/)[1];
                    const channelIcon = html.match(/"thumbnails":\[\{"url":"https:\/\/yt3.ggpht.com\/([^"]+)"\}\]/)[1];
                    const descriptionRegex = html.match(/"attributedDescription":{"content":"([^"]+)"/);
                    const videoDescription = descriptionRegex ? descriptionRegex[1] : "No description available for this video.";

                    let videoTitle = html.match(/"title":{"runs":\[\{"text":"([^"]+)"\}\]/)[1];
                    let description = videoDescription.replace(/\\n/g, " ");

                    if (videoTitle.length > 40) videoTitle = `${videoTitle.slice(0, 37)}...`;
                    if (description.length > 140) description = `${description.slice(0, 137)}...`;

                    const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setURL(`https://www.youtube.com/watch?v=${latestID}`)
                    .setTitle(videoTitle)
                    .setThumbnail(`https://yt3.ggpht.com/${channelIcon}`)
                    .setDescription(description)
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