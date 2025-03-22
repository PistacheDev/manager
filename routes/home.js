const config = require("../json/config.json");

module.exports =
{
    name: "/home",
    async run(req, res)
    {
        try
        {
            const appVersion = config.version;
            res.status(200).render("../website/html/home.ejs", { version: appVersion });
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, home, ${err}, ${Date.now()}`);
        };
    }
};