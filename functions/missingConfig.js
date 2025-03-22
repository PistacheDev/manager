const { db } = require("../main");

async function fixMissingConfig(guild)
{
    return new Promise((resolve, reject) =>
    {
        db.query("INSERT INTO config (`guild`) VALUES (?)", [guild.id], async (err) =>
        {
            if (err) return reject(err);

            setTimeout(() =>
            {
                db.query("SELECT * FROM config WHERE guild = ?", [guild.id], (err, data) =>
                {
                    if (err) return reject(err);
                    resolve(data);
                });
            }, 100);
        });
    });
};

module.exports =
{
    fixMissingConfig
};