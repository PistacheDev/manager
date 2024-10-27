const jsonwebtoken = require('jsonwebtoken');
const { request } = require('../functions/discordRequest');
const { client, db } = require('../main');
const { PermissionsBitField } = require('discord.js');
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: '/dashboard/guilds/:id/xp',
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
                        db.query('INSERT INTO config (`guild`) VALUES (?)', [guild.id], async () =>
                        {
                            return res.status(200).redirect(`/dashboard/guilds/${guild.id}/xp`); // Reload the page.
                        });
                    };

                    // Required values to render the page.
                    let values =
                    {
                        availableGuilds: availableGuilds,
                        guildName: guild.name,
                        guildIcon: guild.iconURL(),
                        guildID: guild.id,
                        xpSettings: data[0].xp,
                        xpGoals: data[0].xpgoals
                    };

                    await res.status(200).render('../website/html/guildXP.ejs', values); // Render the page.
                });
            };

            // Configuration edition.
            function editData()
            {
                switch (req.query.value)
                {
                    case 'settings':
                        const disable = req.query.disable;
                        var status = 0; // Disable the option.

                        if (!disable)
                        {
                            // Some data.
                            const alert = req.query.alert;
                            const xp = req.query.xp;
                            const level = req.query.level;

                            // Some verifications.
                            if (!alert || !xp || !level) return res.status(403).send('Some information in your request are missing!');
                            if (alert != 'yes' && alert != 'no') return res.status(403).send('The provided data for the "Alert when level up" option is invalid!');
                            if (isNaN(xp) || isNaN(level)) return res.status(403).send('Please, enter a number!');
                            if (xp < 1 || xp > 50) return res.status(403).send('The maximum amount of XP per message must be betweeen 1 and 50!');
                            if (level < 10 || level > 100) return res.status(403).send('The maximum level must be between 10 and 100!');

                            status = `${alert == 'yes' ? 1 : 0} ${xp} ${level}`;
                        };

                        db.query('UPDATE config SET xp = ? WHERE guild = ?', [status, guild.id]);
                        break;

                    case 'goals':
                        // Some data.
                        const goal = req.query.goal;
                        const level = req.query.level;
                        const roleID = req.query.role;
                        
                        // Some verifications.
                        if (!goal || !level) return res.status(403).send('Some information in your request are missing!');
                        if (isNaN(goal) || isNaN(level)) return res.status(403).send('Please, enter a number!');
                        if (goal < 1 || goal > 4) return res.status(403).send('The goal must be between 1 and 4!');
                        if (level < 10 || level > 100) return res.status(403).send('The level must be between 10 and 100!');
                        if (roleID && !guild.roles.cache.get(roleID)) return res.status(403).send('This role doesn\'t exist!');

                        db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
                        {
                            if (err) throw err;
                            if (data[0].xp == 0) return res.status(403).send('The XP system is disabled in this server!');
                            const xpGoals = data[0].xpgoals.split(' ');

                            // Update the targeted data.
                            if (roleID) xpGoals[goal - 1] = `${level}-${roleID}`;
                            else xpGoals[goal - 1] = 0;

                            db.query('UPDATE config SET xpgoals = ? WHERE guild = ?', [`${xpGoals[0]} ${xpGoals[1]} ${xpGoals[2]} ${xpGoals[3]}`, guild.id]);
                        });
                        break;

                    default:
                        res.status(403).send('The setting that your request provided is invalid!');
                        break;
                };

                res.status(200).redirect(`/dashboard/guilds/${guild.id}/xp`); // Reload the page.
            };
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, guildXP, ${err}, ${Date.now()}`);
        };
    }
};