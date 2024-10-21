module.exports =
{
    name: '/logout',
    async run(req, res)
    {
        try
        {
            res.clearCookie('sessionKey'); // Delete the "sessionKey" cookie.
            res.status(200).redirect('/home');
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, logout, ${err}, ${Date.now()}`);
        };
    }
};