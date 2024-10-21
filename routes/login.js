const { express } = require('../config.json');

module.exports =
{
    name: '/login',
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) res.status(200).redirect(express.login); // If the user isn't logged in, redirect the user to the Discord login page.
            else res.status(200).redirect('/dashboard'); // Else, redirect the user to the dashboard.
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, login, ${err}, ${Date.now()}`);
        };
    }
};