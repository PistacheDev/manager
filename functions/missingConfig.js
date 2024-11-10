const { db } = require('../main');

function fixMissingConfig(guild)
{
    db.query('INSERT INTO config (`guild`) VALUES (?)', [guild.id], async (err) =>
    {
        if (err) throw err;
        setTimeout(() => {}, 100); // Wait to let the database correctly insert the data.

        db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
        {
            if (err) throw err;
            return data;
        });
    });
};

module.exports =
{
    fixMissingConfig
};