const { requestToken } = require("../functions/discord");
const { client } = require("../main");
const config = require("../json/config.json");
const jsonwebtoken = require("jsonwebtoken");

module.exports =
{
    name: "/callback",
    async run(req, res)
    {
        try
        {
            if (!req.query.code) return res.status(403).redirect("/login");

            const requestData =
            {
                client_id: client.user.id,
                client_secret: process.env.APP_SECRET,
                grant_type: "authorization_code",
                code: req.query.code,
                redirect_uri: `http://${config.express.host}:${config.express.port}/callback`,
                scope: ["identify", "guilds"]
            };

            const response = await requestToken(requestData);
            const sessionKey = jsonwebtoken.sign({ data: response.data.access_token }, process.env.ENCRYPTION_KEY);

            res.cookie("sessionKey", sessionKey, { maxAge: response.data.expires_in, secure: true, httpOnly: true });
            await res.status(200).redirect("/dashboard");
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, callback, ${err}, ${Date.now()}`);
        };
    }
};