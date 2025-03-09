const { client } = require("../main");
const config = require("../json/config.json");

module.exports =
{
    name: "/login",
    async run(req, res)
    {
        try
        {
            // If the user isn't logged in, redirect the user to the Discord login page.
            if (!req.cookies.sessionKey) res.status(200).redirect(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&response_type=code&redirect_uri=http%3A%2F%2F${config.express.host}%3A${config.express.port}%2Fcallback&scope=identify+guilds`)
            else res.status(200).redirect("/dashboard");
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, login, ${err}, ${Date.now()}`);
        };
    }
};