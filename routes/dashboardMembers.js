const jsonwebtoken = require("jsonwebtoken");
const { requestInfo } = require("../functions/discordRequest");
const { client, db } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "/dashboard/:id/members",
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

            const userGuilds = await requestInfo("https://discord.com/api/users/@me/guilds", accessToken.data);
            let availableGuilds = [];

            for (let i = 0; i < userGuilds.data.length; i++)
            {
                // Check if the application can access this guild.
                const guild = client.guilds.cache.get(userGuilds.data[i].id);
                if (!guild) continue;

                // Check if the user is a member of this guild.
                const member = guild.members.cache.get(userInfo.data.id);
                if (!member) continue;

                // Check if the user can manage this guild.
                if (!userGuilds.data[i].owner && !member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild)) continue;
                availableGuilds.push(userGuilds.data[i]);
            };

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const memberAdd = data[0].memberAdd != 0 ? !guild.channels.cache.get(data[0].memberAdd) ? 0 : guild.channels.cache.get(data[0].memberAdd).name : 0;
                const joinRole = data[0].joinRole != 0 ? !guild.roles.cache.get(data[0].joinRole) ? 0 : guild.roles.cache.get(data[0].joinRole).name : 0;
                const memberRemove = data[0].memberRemove != 0 ? !guild.channels.cache.get(data[0].memberRemove) ? 0 : guild.channels.cache.get(data[0].memberRemove).name : 0;

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
                    memberadd: memberAdd,
                    joinrole: joinRole,
                    autonormalizer: data[0].autoNormalizer,
                    memberremove: memberRemove,
                    channels: availableChannels,
                    roles: availableRoles
                };

                // Render and display the page.
                await res.status(200).render("../website/html/dashboardMembers.ejs", values);
            });
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, dashboard, members, ${err}, ${Date.now()}`);
        };
    }
};