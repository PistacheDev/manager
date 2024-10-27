const jsonwebtoken = require('jsonwebtoken');
const { request } = require('../functions/discordRequest');
const { client } = require('../main');
const { PermissionsBitField } = require('discord.js');
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: '/dashboard/guilds',
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) return res.status(403).redirect('/login'); // Check if the user is logged in.

            const accessToken = jsonwebtoken.verify(req.cookies.sessionKey, process.env.JWT); // Decode the session key and verify the signature.
            const userGuilds = await request('https://discord.com/api/users/@me/guilds', accessToken.data); // Request the user's servers list to Discord.
            const userIdentity = await request('https://discord.com/api/users/@me', accessToken.data); // Request the user's profile to Discord.
            var availableGuilds = [];

            for (let i = 0; i < userGuilds.data.length; i++)
            {
                // Check if the application can access this guild.
                const guild = client.guilds.cache.get(userGuilds.data[i].id);
                if (!guild) continue;

                // Check if the user is a member of this guild.
                const member = guild.members.cache.get(userIdentity.data.id);
                if (!member) continue;

                // Check if the user can manage this guild.
                if (!userGuilds.data[i].owner && !member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild)) continue;
                availableGuilds.push(userGuilds.data[i]);
            };

            // Required values to render the page.
            let values =
            {
                availableGuilds: availableGuilds
            };

            if (availableGuilds.length < 1) return res.status(200).send('You don\'t have any server to manage!');
            res.status(200).render('../website/html/dashboardGuilds.ejs', values); // Render the page.
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, dashboardGuilds, ${err}, ${Date.now()}`);
        };
    }
};