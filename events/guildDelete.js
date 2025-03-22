module.exports =
{
    name: "guildDelete",
    async run(client, db, guild)
    {
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
};