const axios = require("axios");
const cheerio = require("cheerio");

async function fetchYouTubeName(id)
{
    const request = await axios.get(`https://www.youtube.com/channel/${id}`);
    const html = cheerio.load(request.data).html();
    const name = html.match(/<meta property="og:title" content="([^"]*)">/)[1];

    return name;
};

module.exports =
{
    fetchYouTubeName
};