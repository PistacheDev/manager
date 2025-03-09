module.exports =
{
    name: "/",
    async run(req, res)
    {
        try
        {
            res.status(200).redirect("/home");
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, main, ${err}, ${Date.now()}`);
        };
    }
};