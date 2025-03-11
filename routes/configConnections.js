const jsonwebtoken = require("jsonwebtoken");
const { requestInfo } = require("../functions/discordRequest");
const { client, db } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;
const { fixMissingConfig } = require("../functions/missingConfig");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports =
{
    name: "/dashboard/:id/connections/config",
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) return res.status(403).redirect("/login"); // Check if the user is logged in.
            if (!req.params.id) return res.status(403).send("Bad request!"); // Check if the required guild ID is provided in the request.

            const accessToken = jsonwebtoken.verify(req.cookies.sessionKey, process.env.ENCRYPTION_KEY); // Decode the access token and verify the signature.
            const userInfo = await requestInfo("https://discord.com/api/users/@me", accessToken.data);

            // Some server verifications.
            const guild = client.guilds.cache.get(req.params.id);
            if (!guild) return res.status(500).send("The application isn't installed on this server!");

            // Some user verifications.
            const member = guild.members.cache.get(userInfo.data.id);
            if (!member) return res.status(403).send("You aren't a member of this server!");
            if (!member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild) && guild.ownerId != userInfo.data.id) return res.status(403).send("You don't have the required permissions in this server!");

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                // Read current values.
                const currentYouTube = data[0].youtube;
                const currentTwitch = data[0].twitch;

                // Read data.
                var youtube = req.query.youtube;
                const youtubeChannel = req.query.youtubeChannel;
                const youtubeRole = req.query.youtubeRole;
                const youtubeUrl = req.query.youtubeUrl;
                var twitch = req.query.twitch;
                const twitchChannel = req.query.twitchChannel;
                const twitchRole = req.query.twitchRole;
                const twitchUrl = req.query.twitchUrl;

                if (youtube && youtubeChannel)
                {
                    const channel = guild.channels.cache.get(youtubeChannel);
                    const role = guild.roles.cache.get(youtubeRole);
                    let request;

                    try
                    {
                        request = await axios.get(`${youtubeUrl}/videos`);
                    }
                    catch (err)
                    {
                        res.status(403).send("The YouTube channel provided doesn't exist!");
                        console.error(`[error] website, configConnections, youtube, ${err}, ${Date.now()}`);
                        return;
                    };

                    const html = cheerio.load(request.data).html();
                    const regex = /"webCommandMetadata":{"url":"\/watch\?v=([^"]+)"/;
                    const latestVideoID = `${html.match(regex) ? html.match(regex)[1] : 0}`;
                    const youtubeID = html.match(/"channelUrl":"([^"]+)"/)[1].split("channel/")[1];

                    if (!channel || !channel.permissionsFor(member.id).has(Perms.ViewChannel) || !channel.permissionsFor(client.user.id).has(Perms.ViewChannel && Perms.SendMessages)) return res.status(403).send("The channel provided for the YouTube notifications is not valid!");
                    if (!role || role.permissions.has(Perms.Administrator) || role.permissions.has(Perms.ManageGuild)) return res.status(403).send("The role provided for the YouTube notifications is not valid!");

                    youtube = `${channel.id} ${role.id} ${youtubeID} ${latestVideoID} 0`;
                };

                if (twitch && twitchChannel)
                {
                    const channel = guild.channels.cache.get(twitchChannel);
                    const role = guild.roles.cache.get(twitchRole);

                    try
                    {
                        await axios.get(twitchUrl);
                    }
                    catch (err)
                    {
                        res.status(403).send("The Twitch channel provided doesn't exist!");
                        console.error(`[error] website, configConnections, twitch, ${err}, ${Date.now()}`);
                        return;
                    };

                    if (!channel || !channel.permissionsFor(member.id).has(Perms.ViewChannel) || !channel.permissionsFor(client.user.id).has(Perms.ViewChannel && Perms.SendMessages)) return res.status(403).send("The channel provided for the Twitch notifications is not valid!");
                    if (!role || role.permissions.has(Perms.Administrator) || role.permissions.has(Perms.ManageGuild)) return res.status(403).send("The role provided for the Twitch notifications is not valid!");

                    const twitchID = twitchUrl.split("twitch.tv/")[1];
                    twitch = `${channel.id} ${role.id} ${twitchID} 0 0`;
                };

                db.query("UPDATE config SET youtube = ?, twitch = ? WHERE guild = ?", [youtube ? youtubeChannel ? youtube : currentYouTube : 0, twitch ? twitchChannel ? twitch : currentTwitch : 0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    await res.status(200).redirect(`/dashboard/${guild.id}/connections`);
                });
            });
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, configConnections, ${err}, ${Date.now()}`);
        };
    }
};