const jsonwebtoken = require('jsonwebtoken');
const { request } = require('../functions/discordRequest');
const { client, db } = require('../main');
const { PermissionsBitField } = require('discord.js');
const Perms = PermissionsBitField.Flags; // Shortcut.

module.exports =
{
    name: '/dashboard/guilds/:id/sanctions',
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) return res.status(403).redirect('/login'); // Check if the user is logged in.
            if (!req.params.id) return res.status(403).send('Your request is invalid!'); // Check if a guild ID is provided in the request (":id" setting).

            const accessToken = jsonwebtoken.verify(req.cookies.sessionKey, process.env.JWT); // Decode the access token and verify the signature.
            const userIdentity = await request('https://discord.com/api/users/@me', accessToken.data); // Request the user's profile to Discord.

            // Some server verifications.
            const guild = client.guilds.cache.get(req.params.id);
            if (!guild) return res.status(500).send('The application isn\'t installed on this server!');

            // Some user verifications.
            const member = guild.members.cache.get(userIdentity.data.id);
            if (!member) return res.status(403).send('You\'re not a member of this server!');
            if (!member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild) && guild.ownerId != userIdentity.data.id) return res.status(403).send('You don\'t have the required permissions in this server!');

            if (!req.query.value) displayPage()
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

                    // Check if the user can manage this guild.
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
                            return res.status(200).redirect(`/dashboard/guilds/${req.params.id}/connections`); // Reload the page.
                        });
                    };

                    // Required values to render the page.
                    let values =
                    {
                        availableGuilds: availableGuilds,
                        guildName: guild.name,
                        guildIcon: guild.iconURL(),
                        guildID: guild.id,
                        antispam: data[0].antispam,
                        warn: data[0].warn
                    };

                    await res.status(200).render('../website/html/guildSanctions.ejs', values); // Render the page.
                });
            };

            // Configuration edition.
            async function editData()
            {
                // Some request verifications.
                if (req.query.value != 'antispam' && req.query.value != 'warn') return res.status(403).send('The setting provided is invalid!');
                if (!req.query.data) return res.status(403).send('Some informations in your request are missing!');

                if (req.query.data == 'false')
                {
                    if (req.query.value == 'antispam') db.query('UPDATE config SET antispam = ? WHERE guild = ?', ['false', guild.id]);
                    else db.query('UPDATE config SET warn = ? WHERE guild = ?', ['false', guild.id]);
                    res.status(200).redirect(`/dashboard/guilds/${guild.id}/sanctions`); // Reload the page.
                }
                else
                {
                    switch (req.query.value)
                    {
                        case 'antispam':
                            if (!req.query.bots || !req.query.messages || !req.query.interval || !req.query.warns || !req.query.sanction) return res.status(403).send('Some informations in your request are missing!');
                            if (req.query.bots != 'yes' && req.query.bots != 'no') return res.status(403).send('Your answer for the Ignore Bots option is invalid!');
                            if (isNaN(req.query.messages) || isNaN(req.query.interval) || isNaN(req.query.warns) || (req.query.sanction != 'ban' && isNaN(req.query.sanction))) return interaction.reply('Please! Enter a number!');
                            if (req.query.messages < 1 || req.query.messages > 10) return interaction.reply('The maximum messages must be between 1 and 10 messages!');
                            if (req.query.interval < 1 || req.query.interval > 10) return interaction.reply('The interval must be between 1 and 10 seconds!');
                            if (req.query.warns < 1 || req.query.warns > 5) return interaction.reply('The maximum warns must be between 1 and 5 warns!');
                            if (req.query.sanction != 'ban' && (req.query.sanction < 1 || req.query.sanction > 70560)) return interaction.reply('The mute can\'t last less than 1 minute or longer than 7 days (70560)!');

                            db.query('UPDATE config SET antispam = ? WHERE guild = ?', [`true ${req.query.data == 'yes' ? 'true' : 'false'} ${req.query.messages} ${req.query.interval} ${req.query.warns} ${req.query.sanction}`, guild.id]);
                            res.status(200).redirect(`/dashboard/guilds/${guild.id}/sanctions`); // Reload the page.
                            break;

                        case 'warn':
                            if (!req.query.warns || !req.query.sanction) return res.status(403).send('Some informations in your request are missing!');
                            if (isNaN(req.query.warns) || (req.query.sanction != 'ban' && isNaN(req.query.sanction))) return interaction.reply('Please! Enter a number!');
                            if (req.query.warns < 1 || req.query.warns > 10) return interaction.reply('The maximum warns must be between 1 and 10 warns!');
                            if (req.query.sanction != 'ban' && (req.query.sanction < 1 || req.query.sanction > 168)) return interaction.reply('The mute can\'t last less than 1 minute or longer than 7 days (168)!');

                            db.query('UPDATE config SET warn = ? WHERE guild = ?', [`true ${req.query.warns} ${req.query.sanction}`, guild.id]);
                            res.status(200).redirect(`/dashboard/guilds/${guild.id}/sanctions`); // Reload the page.
                            break;
                    };
                };
            };
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, guildConnections, ${err}, ${Date.now()}`);
        };
    }
};