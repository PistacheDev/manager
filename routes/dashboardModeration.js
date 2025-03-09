module.exports =
{
    name: "/dashboard/:id/moderation",
    async run(req, res)
    {
        try
        {
            res.status(200).send("Coming soon!");
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, dashboard, moderation, ${err}, ${Date.now()}`);
        };
    }
};