const axios = require("axios");
const cheerio = require("cheerio");

async function fetchYouTubeName(id)
{
    try
    {
        request = await axios.get(`https://www.youtube.com/channel/${id}`);
    }
    catch (err)
    {
        console.error(`[error] fetchYoutubeName,${err}, ${Date.now()}`);
        return;
    };

    const html = cheerio.load(request.data).html();
    const name = html.match(/<meta property="og:title" content="([^"]*)">/)[1];
    return name;
};

module.exports =
{
    fetchYouTubeName
};