const querystring = require('querystring');
const axios = require('axios');
const { client } = require('../main');
const config = require('../config.json');
const jsonwebtoken = require('jsonwebtoken');

// Request the access token to Discord.
async function requestToken(url, requestData)
{
    const stringRequest = querystring.stringify(requestData); // Stringify the request data.

    for (let i = 0; i < 3; i++)
    {
        try
        {
            const response = await axios.post(url, stringRequest,
            {
                headers:
                {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response;
        }
        catch (err)
        {
            if (i == 2) throw err; // Send an error after three attempts failed.
            await new Promise(resolve => setTimeout(resolve, 250)); // Wait 250ms before a new request to avoid to create too many requests.
        };
    };
};

module.exports =
{
    name: '/callback',
    async run(req, res)
    {
        try
        {
            if (!req.query.code) return res.status(403).redirect('/login'); // Check if Discord provide the code.

            // Informations for the request to Discord.
            const requestData =
            {
                client_id: client.user.id,
                client_secret: process.env.APP_SECRET,
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: config.express.callback,
                scope: ['identify', 'guilds']
            };

            const response = await requestToken('https://discord.com/api/oauth2/token', requestData);
            const sessionKey = jsonwebtoken.sign({ data: response.data.access_token }, process.env.JWT); // Encode the access token and sign it.

            // Create a secure cookie with the session key and set the maxAge to the token expiration.
            res.cookie('sessionKey', sessionKey, { maxAge: response.data.expires_in, secure: true, httpOnly: true });
            await res.status(200).redirect('/dashboard');
        }
        catch (err)
        {
            res.status(500).send('An unexpected error occured! Please, try again later!');
            console.error(`[error] website, callback, ${err}, ${Date.now()}`);
        };
    }
};