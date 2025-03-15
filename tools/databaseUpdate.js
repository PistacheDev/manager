const db = require("../main").db;

// This tool is only temporary and will be removed in the next update.
// It's only to automatically update the database to adapt to the modifications in the config table.

// Tasks:
// 1) Update the config table structure for the same reason.
// 2) Change the values in the config table to adapt to the code modifications.

function updateDatabase()
{
    const queries =
    [
        "ALTER TABLE config ALTER COLUMN antispam SET DEFAULT '5 5 2 10'",
        "ALTER TABLE config ALTER COLUMN antiswear SET DEFAULT '3 60'",
        "ALTER TABLE config ALTER COLUMN antipings SET DEFAULT '20'",
        "ALTER TABLE config ALTER COLUMN antilinks SET DEFAULT '1'"
    ];

    queries.forEach((query) => {
        db.query(query, async (err) =>
        {
            if (err)
            {
                console.error(`[error] ${query} ➜ ${err}`);
            };
        });
    });

    db.query("SELECT * FROM config", async (err, data) =>
    {
        if (err) throw err;

        for (let i = 0; i < data.length; i++)
        {
            const guild = data[i].guild;
            const antispam = data[i].antispam;
            const antiswear = data[i].antiswear;
            const antipings = data[i].antipings;
            const antilinks = data[i].antilinks;
            var newAntispam, newAntiswear, newAntipings, newAntilinks;

            if (antispam != 0) newAntispam = `${antispam.split(" ")[1]} ${antispam.split(" ")[2]} ${antispam.split(" ")[3]} ${antispam.split(" ")[4]}`;
            if (antiswear != 0) newAntiswear = `${antiswear.split(" ")[2]} ${antiswear.split(" ")[3]}`;
            if (antipings != 0) newAntipings = antipings.split(" ")[1];
            if (antilinks == 2) newAntilinks = 1;

            db.query("UPDATE config SET antispam = ?, antiswear = ?, antipings = ?, antilinks = ? WHERE guild = ?", [newAntispam, newAntiswear, newAntipings, newAntilinks, guild], async (err) =>
            {
                if (err) throw err;

                console.log(`Updated the configuration for ${guild}:`);
                console.log(`- ${antispam} ➜ ${newAntispam}`);
                console.log(`- ${antiswear} ➜ ${newAntiswear}`);
                console.log(`- ${antipings} ➜ ${newAntipings}`);
                console.log(`- ${antilinks} ➜ ${newAntilinks}\n`);
            });
        };
    });
};

module.exports =
{
    updateDatabase
};