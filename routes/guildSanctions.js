const jsonwebtoken = require('jsonwebtoken');
const { request } = require('../functions/discordRequest');
const { client, db } = require('../main');
const { PermissionsBitField } = require('discord.js');
const Perms = PermissionsBitField.Flags;

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
                        db.query('INSERT INTO config (`guild`) VALUES (?)', [guild.id], async () =>
                        {
                            return res.status(200).redirect(`/dashboard/guilds/${guild.id}/sanctions`); // Reload the page.
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
                        warn: data[0].warn,
                        antipings: data[0].antipings
                    };

                    await res.status(200).render('../website/html/guildSanctions.ejs', values); // Render the page.
                });
            };

            // Configuration edition.
            async function editData()
            {
                const disable = req.query.disable;

                switch (req.query.value)
                {
                    case 'antispam':
                        var status = 0; // Disable the option.

                        if (!disable)
                        {
                            // Some shortcuts.
                            const ignoreBots = req.query.bots;
                            const maxMessages = req.query.messages;
                            const interval = req.query.interval;
                            const maxWarns = req.query.warns;
                            const sanction = req.query.sanction;

                            // Some verifications
                            if (!ignoreBots || !maxMessages || !interval || !maxWarns || !sanction) return res.status(403).send('Some information in your request are missing!');
                            if (ignoreBots != 'yes' && ignoreBots != 'no') return res.status(403).send('Your answer for the Ignore Bots option is invalid!');
                            if (isNaN(maxMessages) || isNaN(interval) || isNaN(maxWarns) || (sanction != 'ban' && isNaN(sanction))) return interaction.reply('Please! Enter a number!');
                            if (maxMessages < 1 || maxMessages > 10) return interaction.reply('The maximum messages must be between 1 and 10 messages!');
                            if (interval < 1 || interval > 10) return interaction.reply('The interval must be between 1 and 10 seconds!');
                            if (maxWarns < 1 || maxWarns > 5) return interaction.reply('The maximum warns must be between 1 and 5 warns!');
                            if (sanction != 'ban' && (sanction < 1 || sanction > 70560)) return interaction.reply('The mute can\'t last less than 1 minute or longer than 7 days (70560)!');

                            status = `true ${ignoreBots == 'yes' ? 1 : 0} ${maxMessages} ${interval} ${maxWarns} ${sanction}`;
                        };

                        // Update the configuration.
                        db.query('UPDATE config SET antispam = ? WHERE guild = ?', [status, guild.id]);
                        break;

                    case 'warn':
                        var status = 0; // Disable the option.

                        if (!disable)
                        {
                            // Some shortcuts.
                            const maxWarns = req.query.warns;
                            const sanction = req.query.sanction;

                            // Some verifications.
                            if (!maxWarns || !sanction) return res.status(403).send('Some information in your request are missing!');
                            if (isNaN(maxWarns) || (sanction != 'ban' && isNaN(sanction))) return interaction.reply('Please! Enter a number!');
                            if (maxWarns < 1 || maxWarns > 10) return interaction.reply('The maximum warns must be between 1 and 10 warns!');
                            if (sanction != 'ban' && (sanction < 1 || sanction > 168)) return interaction.reply('The mute can\'t last less than 1 minute or longer than 7 days (168)!');

                            status = `true ${maxWarns} ${sanction}`;
                        };

                        // Update the configuration.
                        db.query('UPDATE config SET warn = ? WHERE guild = ?', [status, guild.id]);
                        break;

                    case 'antipings':
                        var status = 0; // Disable the option.

                        if (!disable)
                        {
                            // Some shortcuts.
                            const ignoreBots = req.query.bots;
                            const sanction = req.query.sanction;

                            // Some verifications
                            if (!ignoreBots || !sanction) return res.status(403).send('Some information in your request are missing!');
                            if (ignoreBots != 'yes' && ignoreBots != 'no') return res.status(403).send('Your answer for the Ignore Bots option is invalid!');
                            if (sanction != 'ban' && isNaN(sanction)) return interaction.reply('Please! Enter a number or "ban" for the sanction!');
                            if (sanction != 'ban' && (sanction < 1 || sanction > 70560)) return interaction.reply('The mute can\'t last less than 1 minute or longer than 7 days (70560)!');

                            status = `true ${ignoreBots == 'yes' ? 1 : 0} ${sanction}`;
                        };

                        // Update the configuration.
                        db.query('UPDATE config SET antipings = ? WHERE guild = ?', [status, guild.id]);
                        break;

                    default:
                        res.status(403).send('The setting that your request provided is invalid!');
                        break;
                };

                res.status(200).redirect(`/dashboard/guilds/${guild.id}/sanctions`); // Reload the page.
            };
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, guildConnections, ${err}, ${Date.now()}`);
        };
    }
};