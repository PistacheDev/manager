const newMembers = new Map();

async function autoraidmode(data, member)
{
    if (data[0].raidmode == 0 && data[0].autoraidmode != 0)
    {
        const guild = member.guild;
        const [maxMembers, interval] = data[0].autoraidmode.split(" ");
        const now = Date.now();
        const timestamps = newMembers.get(guild.id) || [];
        const filter = timestamps.filter(timestamp => now - timestamp < interval * 1000);

        // Add the member to the Map.
        filter.push(now);
        newMembers.set(guild.id, filter);

        if (filter.length >= maxMembers) // Limit exceeded.
        {
            db.query("UPDATE config SET raidmode = ? WHERE guild = ?", [1, guild.id], async (err) =>
            {
                if (err) throw err;
            });
        };
    };
};

module.exports =
{
    autoraidmode
};