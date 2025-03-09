const jsonwebtoken = require("jsonwebtoken");
const { requestInfo } = require("../functions/discordRequest");
const { client } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: "/dashboard",
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) return res.status(403).redirect("/login"); // Check if the user is logged in.
            const accessToken = jsonwebtoken.verify(req.cookies.sessionKey, process.env.ENCRYPTION_KEY); // Decode the session key and verify the signature.

            // Request some required info.
            const userGuilds = await requestInfo("https://discord.com/api/users/@me/guilds", accessToken.data);
            const userInfo = await requestInfo("https://discord.com/api/users/@me", accessToken.data);
            var availableGuilds = [];

            for (let i = 0; i < userGuilds.data.length; i++)
            {
                // Check if the application can access this guild.
                const guild = client.guilds.cache.get(userGuilds.data[i].id);
                if (!guild) continue;

                // Check if the user is a member of this guild.
                const member = guild.members.cache.get(userInfo.data.id);
                if (!member) continue;

                // Check if the user is allowed to manage this guild.
                if (!userGuilds.data[i].owner && !member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild)) continue;
                availableGuilds.push(userGuilds.data[i]);
            };

            // Required values to render the page.
            let values =
            {
                availableGuilds: availableGuilds,
                username: userInfo.data.username
            };

            // Render and display the page.
            res.status(200).render("../website/html/dashboard.ejs", values);
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, dashboard, ${err}, ${Date.now()}`);
        };
    }
};