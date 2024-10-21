const axios = require('axios');

async function request(url, token)
{
    for (let i = 0; i < 3; i++)
    {
        try
        {
            return await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` }});
        }
        catch (err)
        {
            if (i >= 2) throw err; // Return an error after three attempts failed.
            await new Promise(resolve => setTimeout(resolve, 250)); // Wait 250ms before send a new request to avoid to create too many requests.
        };
    };
};

module.exports =
{
    request
};