const jsonwebtoken = require('jsonwebtoken');
const { request } = require('../functions/discordRequest');
const { client, db } = require('../main');
const { PermissionsBitField } = require('discord.js');
const Perms = PermissionsBitField.Flags; // Shortcut.

module.exports =
{
    name: '/dashboard/guilds/:id/security',
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) return res.status(403).redirect('/login'); // Check if the user is logged in.
            if (!req.params.id) return res.status(403).send('Your request is invalid!'); // Check if a guild ID is provided in the URL (":id" setting).

            const accessToken = jsonwebtoken.verify(req.cookies.sessionKey, process.env.JWT); // Decode the access token and verify the signature.
            const userIdentity = await request('https://discord.com/api/users/@me', accessToken.data); // Request the user's profile to Discord.

            // Some server verifications.
            const guild = client.guilds.cache.get(req.params.id);
            if (!guild) return res.status(403).send('The application isn\'t installed on this server!');

            // Some user verifications.
            const member = guild.members.cache.get(userIdentity.data.id);
            if (!member) return res.status(403).send('You aren\'t a member of this server!');
            if (!member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild) && guild.ownerId != userIdentity.data.id) return res.status(403).send('You don\'t have the required permissions in this server!');

            if (!req.query.value) displayPage();
            else editData();

            // Render and display the page.
            async function displayPage()
            {
                const userGuilds = await request('https://discord.com/api/users/@me/guilds', accessToken.data); // Request the user's servers list to Discord.
                let availableGuilds = [];

                for (let i = 0; i < userGuilds.data.length; i++)
                {
                    // Check if the application can access this guild.
                    const guild = client.guilds.cache.get(userGuilds.data[i].id);
                    if (!guild) continue;

                    // Check if the user is a member of this guild.
                    const member = guild.members.cache.get(userIdentity.data.id);
                    if (!member) continue;

                    // Check if the user can manage on this guild.
                    if (!userGuilds.data[i].owner && !member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild)) continue;
                    availableGuilds.push(userGuilds.data[i]);
                };

                if (availableGuilds.length < 1) return res.status(200).send('You don\'t have any server to manage!');
                db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
                {
                    if (data.length < 1)
                    {
                        // Add this server to the database if not already done.
                        db.query('INSERT INTO config (`guild`) VALUES (?)', [req.params.id], async () =>
                        {
                            return res.status(200).redirect(`/dashboard/guilds/${req.params.id}/logs`); // Reload the page.
                        });
                    };

                    // Required values to render the page.
                    let values =
                    {
                        availableGuilds: availableGuilds,
                        guildName: guild.name,
                        guildIcon: guild.iconURL(),
                        guildID: guild.id,
                        raidmodeStatut: data[0].raidmode,
                        antibotStatut: data[0].antibot
                    };

                    await res.status(200).render('../website/html/guildSecurity.ejs', values); // Render the page.
                });
            };

            // Configuration edition.
            function editData()
            {
                const data = req.query.data; // Shortcut.
                if (!data) return res.status(403).send('Some information in your request are missing!')

                switch (req.query.value)
                {
                    case 'raidmode':
                        if (guild.ownerId != userIdentity.data.id) return res.status(403).send('Only the server\'s owner can edit this setting!');
                        if (data != 'true' && data != 'false') return res.status(403).send('The new data provided is invalid!');

                        db.query('UPDATE config SET raidmode = ? WHERE guild = ?', [data, guild.id]);
                        break;

                    case 'antibot':
                        if (guild.ownerId != userIdentity.data.id) return res.status(403).send('Only the server\'s owner can edit this setting!');
                        if (data != 'true' && data != 'false') return res.status(403).send('The new data provided is invalid!');

                        db.query('UPDATE config SET antibot = ? WHERE guild = ?', [data, guild.id]);
                        break;

                    default:
                        res.status(403).send('The setting that your request provided is invalid!');
                        break;
                };

                res.status(200).redirect(`/dashboard/guilds/${guild.id}/security`); // Reload the page.
            };
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, guildSecurity, ${err}, ${Date.now()}`);
        };
    }
};