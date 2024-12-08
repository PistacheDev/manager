const { version } = require("../config.json");

module.exports =
{
    name: "/home",
    async run(req, res)
    {
        try
        {
            res.status(200).render("../website/html/home.ejs", { version: version }); // Render the page.
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again later!");
            console.error(`[error] website, home, ${err}, ${Date.now()}`);
        };
    }
};