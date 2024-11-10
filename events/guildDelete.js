module.exports =
{
    name: 'guildDelete',
    async run(client, db, guild)
    {
        try
        {
            // We remove everything related to the server from the dfatabse to save some space on the server.

            db.query('DELETE FROM config WHERE guild = ?', [guild.id], async (err) =>
            {
                if (err) throw err;
            });

            db.query('DELETE FROM warns WHERE guild = ?', [guild.id], async (err) =>
            {
                if (err) throw err;
            });

            db.query('DELETE FROM xp WHERE guild = ?', [guild.id], async (err) =>
            {
                if (err) throw err;
            });
        }
        catch (err)
        {
            console.error(`[error] guildDelete, ${err}, ${Date.now()}`);
        };
    }
};