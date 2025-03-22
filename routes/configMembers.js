const jsonwebtoken = require("jsonwebtoken");
const { requestInfo } = require("../functions/discord");
const { client, db } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "/dashboard/:id/members/config",
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

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const currentMemberAdd = data[0].memberAdd;
                const currentJoinRole = data[0].joinRole;
                const currentMemberRemove = data[0].memberRemove;

                const memberadd = req.query.memberadd;
                const memberaddID = req.query.memberaddID;
                const joinrole = req.query.joinrole;
                const joinroleID = req.query.joinroleID;
                const autonormalizer = req.query.autonormalizer;
                const memberremove = req.query.memberremove;
                const memberremoveID = req.query.memberremoveID;

                if (memberadd && memberaddID)
                {
                    const channel = guild.channels.cache.get(memberaddID);
                    if (!channel || !channel.permissionsFor(member.id).has(Perms.ViewChannel) || !channel.permissionsFor(client.user.id).has(Perms.ViewChannel && Perms.SendMessages)) return res.status(403).send("The channel provided for the arrival messages is not valid!");
                };

                if (joinrole && joinroleID)
                {
                    const role = guild.roles.cache.get(joinroleID);
                    if (!role || role.permissions.has(Perms.Administrator) || role.permissions.has(Perms.ManageGuild)) return res.status(403).send("The role provided for the arrival role is not valid!");
                };

                if (memberremove && memberremoveID)
                {
                    const channel = guild.channels.cache.get(memberremoveID);
                    if (!channel || !channel.permissionsFor(member.id).has(Perms.ViewChannel) || !channel.permissionsFor(client.user.id).has(Perms.ViewChannel && Perms.SendMessages)) return res.status(403).send("The channel provided for the departure messages is not valid!");
                };

                db.query("UPDATE config SET memberAdd = ?, joinRole = ?, autoNormalizer = ?, memberRemove = ? WHERE guild = ?", [memberadd ? memberaddID ? memberaddID : currentMemberAdd : 0, joinrole ? joinroleID ? joinroleID : currentJoinRole : 0, autonormalizer ? 1 : 0, memberremove ? memberremoveID ? memberremoveID : currentMemberRemove : 0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    await res.status(200).redirect(`/dashboard/${guild.id}/members`);
                });
            });
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, configMembers, ${err}, ${Date.now()}`);
        };
    }
};