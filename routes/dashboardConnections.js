const jsonwebtoken = require("jsonwebtoken");
const { requestInfo } = require("../functions/discord");
const { client, db } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;
const { fixMissingConfig } = require("../functions/missingConfig");
const { fetchYouTubeName } = require("../functions/youtube");

module.exports =
{
    name: "/dashboard/:id/connections",
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) return res.status(403).redirect("/login");
            if (!req.params.id) return res.status(403).send("Bad request!");

            const accessToken = jsonwebtoken.verify(req.cookies.sessionKey, process.env.ENCRYPTION_KEY);
            const userInfo = await requestInfo("https://discord.com/api/users/@me", accessToken.data);

            const guild = client.guilds.cache.get(req.params.id);
            if (!guild) return res.status(500).send("The application isn't installed on this server!");

            const member = guild.members.cache.get(userInfo.data.id);
            if (!member) return res.status(403).send("You aren't a member of this server!");
            if (!member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild) && guild.ownerId != userInfo.data.id) return res.status(403).send("You don't have the required permissions in this server!");

            const userGuilds = await requestInfo("https://discord.com/api/users/@me/guilds", accessToken.data);
            let availableGuilds = [];

            for (let i = 0; i < userGuilds.data.length; i++)
            {
                const guild = client.guilds.cache.get(userGuilds.data[i].id);
                if (!guild) continue;

                const member = guild.members.cache.get(userInfo.data.id);
                if (!member) continue;

                if (!userGuilds.data[i].owner && !member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild)) continue;
                availableGuilds.push(userGuilds.data[i]);
            };

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                var youtubeNotifs = data[0].youtube;
                var twitchNotifs = data[0].twitch;

                if (youtubeNotifs != 0)
                {
                    var [channel, role, youtubeID, latestVideoID, previousID] = youtubeNotifs.split(" ");

                    if (channel != 0) guild.channels.cache.get(channel) ? channel = guild.channels.cache.get(channel).name : channel = "[failed]";
                    if (role != 0) guild.roles.cache.get(role) ? role = guild.roles.cache.get(role).name : role = "[failed]";
                    if (youtubeID != 0) youtubeID = await fetchYouTubeName(youtubeID);

                    youtubeNotifs = `${channel} ${role} ${youtubeID}`;
                };

                if (twitchNotifs != 0)
                {
                    var [channel, role, twitchID, wasLive, check] = twitchNotifs.split(" ");

                    if (channel != 0) guild.channels.cache.get(channel) ? channel = guild.channels.cache.get(channel).name : channel = "[failed]";
                    if (role != 0) guild.roles.cache.get(role) ? role = guild.roles.cache.get(role).name : role = "[failed]";

                    twitchNotifs = `${channel} ${role} ${twitchID}`;
                };

                const availableChannels = [];
                const availableRoles = [];
                const allChannels = guild.channels.cache;
                const allRoles = guild.roles.cache;

                allChannels.forEach(channel =>
                {
                    if (!channel.permissionsFor(member.id).has(Perms.ViewChannel) || !channel.permissionsFor(client.user.id).has(Perms.ViewChannel && Perms.SendMessages)) return;
                    availableChannels[channel.name] = channel.id;
                });

                allRoles.forEach(role =>
                {
                    if (role.name == "@everyone" || role.permissions.has(Perms.Administrator) || role.permissions.has(Perms.ManageGuild)/* || member.roles.highest.comparePositionTo(role.position) <= 0*/) return;
                    availableRoles[role.name] = role.id;
                });

                let values =
                {
                    availableGuilds: availableGuilds,
                    guildName: guild.name,
                    guildIcon: guild.iconURL(),
                    guildID: guild.id,
                    channels: availableChannels,
                    youtube: youtubeNotifs,
                    twitch: twitchNotifs,
                    roles: availableRoles
                };

                await res.status(200).render("../website/html/dashboardConnections.ejs", values);
            });
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, dashboard, connections, ${err}, ${Date.now()}`);
        };
    }
};