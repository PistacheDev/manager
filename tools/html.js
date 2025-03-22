const axios = require("axios");
const fs = require("fs");

// This tool allows you to download the HTML page of a specific URL.
// This tool has been used for the regex for the YouTube and Twitch systems.

async function saveHTML(url)
{
    request = await axios.get(url);

    fs.writeFile("./debug/output.html", request.data, async (err) =>
    {
        if (err) throw err;
    });
};

module.exports =
{
    saveHTML
};