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

                setTimeout(() => {}, 300); // Wait to avoid to create too many requests.
                const videos = await axios.get(`https://www.youtube.com/channel/${youtubeID}/videos`);
                const html = cheerio.load(videos.data).html(); // Convert the data in HTML.

                const regex = /"webCommandMetadata":{"url":"\/watch\?v=([^"]+)"/;
                const latestVideoID = `${html.match(regex) ? html.match(regex)[1] : 0}`;

                if (latestVideoID != videoID)
                {
                    if (latestVideoID == 0) continue;
                    setTimeout(() => {}, 300);

                    const video = await axios.get(`https://www.youtube.com/watch?v=${latestVideoID}`);
                    const html = cheerio.load(video.data).html(); // Convert the data in HTML.

                    // Fetch required information.
                    let videoTitle = html.match(/"title":{"runs":\[\{"text":"([^"]+)"\}\]/)[1];
                    const channelName = html.match(/"channel":{"simpleText":"([^"]+)"}/)[1];
                    const channelIcon = html.match(/"thumbnails":\[\{"url":"https:\/\/yt3.ggpht.com\/([^"]+)"\}\]/)[1];
                    const descriptionMatch = html.match(/"attributedDescription":{"content":"([^"]+)"/);
                    const fullVideoDescription = descriptionMatch ? descriptionMatch[1] : 'No description available for this video!';
                    let videoDescription = fullVideoDescription.replace(/\\n/g, ' ');

                    // Reduce some data if they are too long for the embed.
                    if (videoTitle.length > 43) videoTitle = `${videoTitle.slice(0, 40)}...`;
                    if (videoDescription.length > 260) videoDescription = `${videoDescription.slice(0, 257)}...`;

                    const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setURL(`https://www.youtube.com/watch?v=${latestVideoID}`)
                    .setTitle(videoTitle)
                    .setThumbnail(`https://yt3.ggpht.com/${channelIcon}`)
                    .setDescription(videoDescription)
                    .setImage(`https://i.ytimg.com/vi/${latestVideoID}/maxresdefault.jpg`)
                    .setTimestamp()
                    .setFooter({ text: channelName, iconURL: `https://yt3.ggpht.com/${channelIcon}` })

                    db.query('UPDATE config SET youtubeNotifs = ? WHERE guild = ?', [`${channelID} ${roleID} ${youtubeID} ${latestVideoID}`, data[i].guild], async (err) =>
                    {
                        if (err) throw err;
                        client.channels.cache.get(channelID).send({ content: `A **new video** is **available**! ||${roleID == '@everyone' ? '@everyone' : `<@&${roleID}>`}||`, embeds: [embed] });
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