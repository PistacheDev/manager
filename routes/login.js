const { client } = require("../main");
const config = require("../json/config.json");

module.exports =
{
    name: "/login",
    async run(req, res)
    {
        try
        {
            const url = config.debug ? `http%3A%2F%2F${config.express.host}%3A${config.express.port}` : "https%3A%2F%2Fmanager.pistachedev.fr";
            res.status(200).redirect(req.cookies.sessionKey ? "/dashboard" : `https://discord.com/oauth2/authorize?client_id=${client.user.id}&response_type=code&redirect_uri=${url}%2Fcallback&scope=identify+guilds`);
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, login, ${err}, ${Date.now()}`);
        };
    }
};