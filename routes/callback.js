const { requestToken } = require("../functions/discordRequest");
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

            // Request to send to Discord.
            const requestData =
            {
                client_id: client.user.id,
                client_secret: process.env.APP_SECRET,
                grant_type: "authorization_code",
                code: req.query.code,
                // This redirect URL needs to be defined in the Discord Dev Portal as a "Redirect" in the "OAuth2" menu.
                redirect_uri: `http://${config.express.host}:${config.express.port}/callback`,
                scope: ["identify", "guilds"]
            };

            const response = await requestToken(requestData);
            const sessionKey = jsonwebtoken.sign({ data: response.data.access_token }, process.env.ENCRYPTION_KEY); // Encode the access token and sign it.

            // Save the encoded token into a cookie in the user's browser.
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