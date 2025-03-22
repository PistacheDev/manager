const jsonwebtoken = require("jsonwebtoken");
const { requestInfo } = require("../functions/discord");
const { client, db } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "/dashboard/:id/moderation",
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

                let values =
                {
                    availableGuilds: availableGuilds,
                    guildName: guild.name,
                    guildIcon: guild.iconURL(),
                    guildID: guild.id,
                    antispam: data[0].antispam,
                    antiswear: data[0].antiswear,
                    warns: data[0].warns,
                    antipings: data[0].antipings,
                    antilinks: data[0].antilinks
                };

                await res.status(200).render("../website/html/dashboardModeration.ejs", values);
            });
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, dashboard, moderation, ${err}, ${Date.now()}`);
        };
    }
};