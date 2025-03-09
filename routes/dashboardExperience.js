module.exports =
{
    name: "/dashboard/:id/experience",
    async run(req, res)
    {
        try
        {
            res.status(200).send("Coming soon!");
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, dashboard, experience, ${err}, ${Date.now()}`);
        };
    }
};