const jsonwebtoken = require("jsonwebtoken");
const { requestInfo } = require("../functions/discordRequest");
const { client, db } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "/dashboard/:id/logs/config",
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
                const currentMessagesLogs = data[0].messagesLogs;
                const currentChannelsLogs = data[0].channelsLogs;
                const currentBansLogs = data[0].bansLogs;

                // Read data.
                const messageslogs = req.query.messageslogs;
                const messageslogsID = req.query.messageslogsID;
                const channelslogs = req.query.channelslogs;
                const channelslogsID = req.query.channelslogsID;
                const banslogs = req.query.banslogs;
                const banslogsID = req.query.banslogsID;

                if (messageslogs && messageslogsID)
                {
                    const channel = guild.channels.cache.get(messageslogsID);
                    if (!channel || !channel.permissionsFor(member.id).has(Perms.ViewChannel) || !channel.permissionsFor(client.user.id).has(Perms.ViewChannel && Perms.SendMessages)) return res.status(403).send("The channel provided for the messages logs is not valid!");
                };

                if (channelslogs && channelslogsID)
                {
                    const channel = guild.channels.cache.get(channelslogsID);
                    if (!channel || !channel.permissionsFor(member.id).has(Perms.ViewChannel) || !channel.permissionsFor(client.user.id).has(Perms.ViewChannel && Perms.SendMessages)) return res.status(403).send("The channel provided for the channels logs is not valid!");
                };

                if (banslogs && banslogsID)
                {
                    const channel = guild.channels.cache.get(banslogsID);
                    if (!channel || !channel.permissionsFor(member.id).has(Perms.ViewChannel) || !channel.permissionsFor(client.user.id).has(Perms.ViewChannel && Perms.SendMessages)) return res.status(403).send("The channel provided for the bans logs is not valid!");
                };

                db.query("UPDATE config SET messagesLogs = ?, channelsLogs = ?, bansLogs = ? WHERE guild = ?", [messageslogs ? messageslogsID ? messageslogsID : currentMessagesLogs : 0, channelslogs ? channelslogsID ? channelslogsID : currentChannelsLogs : 0, banslogs ? banslogsID ? banslogsID : currentBansLogs : 0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    await res.status(200).redirect(`/dashboard/${guild.id}/logs`);
                });
            });
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, configLogs, ${err}, ${Date.now()}`);
        };
    }
};