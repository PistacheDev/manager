const querystring = require("querystring");
const axios = require("axios");

async function requestToken(reqData)
{
    const request = querystring.stringify(reqData);

    for (let i = 0; i < 3; i++)
    {
        try
        {
            const response = await axios.post("https://discord.com/api/oauth2/token", request, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
            return response;
        }
        catch (err)
        {
            if (i == 2) throw err;
            await new Promise(resolve => setTimeout(resolve, 250));
        };
    };
};

async function requestInfo(url, token)
{
    for (let i = 0; i < 3; i++)
    {
        try
        {
            return await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` }});
        }
        catch (err)
        {
            if (i >= 2) throw err;
            await new Promise(resolve => setTimeout(resolve, 250));
        };
    };
};

module.exports =
{
    requestToken,
    requestInfo
};