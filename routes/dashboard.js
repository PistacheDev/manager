const jsonwebtoken = require('jsonwebtoken');
const { request } = require('../functions/discordRequest');

module.exports =
{
    name: '/dashboard',
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) return res.status(403).redirect('/login'); // Check if the user is logged in.

            const accessToken = jsonwebtoken.verify(req.cookies.sessionKey, process.env.JWT); // Decode the sessionKey and check the signature.
            const userIdentity = await request('https://discord.com/api/users/@me', accessToken.data); // Request the user's profile to Discord.

            // Required values to render the page.
            const values =
            {
                username: userIdentity.data.username,
                userID: userIdentity.data.id,
                userIcon: userIdentity.data.avatar
            };

            res.status(200).render('../website/html/dashboard.ejs', values); // Render the page.
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, dashboard, ${err}, ${Date.now()}`);
        };
    }
};