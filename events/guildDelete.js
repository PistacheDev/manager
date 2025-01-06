module.exports =
{
    name: "guildDelete",
    async run(client, db, guild)
    {
        try
        {
            // We remove everything related to this server from the database to save some space on the server disk.

            db.query("DELETE FROM config WHERE guild = ?", [guild.id], async (err) =>
            {
                if (err) throw err;
            });

            db.query("DELETE FROM warns WHERE guild = ?", [guild.id], async (err) =>
            {
                if (err) throw err;
            });

            db.query("DELETE FROM xp WHERE guild = ?", [guild.id], async (err) =>
            {
                if (err) throw err;
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};