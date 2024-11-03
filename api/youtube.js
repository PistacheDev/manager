const axios = require('axios');
const cheerio = require('cheerio');
const { db, client } = require('../main');
const { EmbedBuilder } = require('discord.js');

async function youtubeNotifications()
{
    db.query('SELECT * FROM config', async (err, data) =>
    {
        if (err) throw err;

        for (var i = 0; i < data.length; i++)
        {
            try
            {
                if (data[i].youtubeNotifs == 0) continue; // The option is turned off for this server.
                const [channelID, roleID, youtubeID, videoID] = data[i].youtubeNotifs.split(' ');
                if (roleID == 0 || youtubeID == 0) continue; // The configuration isn't finished for this server.

                await new Promise(resolve => setTimeout(resolve, 250)); // Wait to avoid to create too many requests.
                const videos = await axios.get(`https://www.youtube.com/channel/${youtubeID}/videos`);
                const html = cheerio.load(videos.data).html(); // Convert the data in HTML.

                // Check if the channel has already uploaded a video.
                const regex = /"webCommandMetadata":{"url":"\/watch\?v=([^"]+)"/;
                const latestVideoID = `${html.match(regex) ? html.match(regex)[1] : 0}`;

                if (latestVideoID != videoID)
                {
                    db.query('UPDATE config SET youtubeNotifs = ? WHERE guild = ?', [`${channelID} ${roleID} ${youtubeID} ${latestVideoID}`, data[i].guild], async (err) =>
                    {
                        if (err) throw err;
                    });

                    if (latestVideoID == 0) continue;

                    await new Promise(resolve => setTimeout(resolve, 250)); // Wait to avoid to create too many requests.
                    const video = await axios.get(`https://www.youtube.com/watch?v=${latestVideoID}`);
                    const html = cheerio.load(video.data).html(); // Convert the data in HTML.

                    // Fetch required information.
                    const videoTitle = html.match(/><title>([^<]+)<\/title>/)[1];
                    const channelName = html.match(/"channel":{"simpleText":"([^"]+)"}/)[1];
                    const channelIcon = html.match(/"thumbnails":\[\{"url":"https:\/\/yt3.ggpht.com\/([^"]+)"\}\]/)[1];
                    if (videoTitle.length > 256) videoTitle = `${videoTitle.slice(0, 253)}...`; // If the video's title is longer than 256 characters, we reduce it.

                    const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setURL(`https://www.youtube.com/watch?v=${latestVideoID}`)
                    .setTitle(videoTitle)
                    .setThumbnail(`https://yt3.ggpht.com/${channelIcon}`)
                    .setDescription(`**Video**: https://www.youtube.com/watch?v=${latestVideoID}.`)
                    .setImage(`https://i.ytimg.com/vi/${latestVideoID}/maxresdefault.jpg`)
                    .setTimestamp()
                    .setFooter({ text: channelName, iconURL: `https://yt3.ggpht.com/${channelIcon}` })

                    client.channels.cache.get(channelID).send({ content: `${roleID == '@everyone' ? '@everyone' : `<@&${roleID}>`}`, embeds: [embed] });
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