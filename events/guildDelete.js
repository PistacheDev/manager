module.exports =
{
    name: 'guildDelete',
    async run(client, db, guild)
    {
        try
        {
            const tables = ['config', 'warns', 'xp']; // List of database tables.

            for (let i = 0; i < tables.length; i++)
            {
                // Save some space on the server.
                db.query('DELETE FROM ? WHERE guild = ?', [tables[i], guild.id], async (err) =>
                {
                    if (err) throw err;
                });
            };
        }
        catch (err)
        {
            console.error(`[error] guildDelete, ${err}, ${Date.now()}`);
        };
    }
};