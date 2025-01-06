const { db } = require("../main");

async function addGoalRoles(member, guild, level)
{
    db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
    {
        if (err) throw err;
        if (data.length < 1 || data[0].xp == 0) return;

        for (let i = 0; i < 10; i++)
        {
            const goal = config[0].xpgoals.split(" ")[i];
        
            if (goal != 0)
            {
                const [requiredLevel, roleID] = goal.split("-");
                if (level >= requiredLevel && !member.roles.cache.has(roleID)) member.roles.add(roleID);
            };
        };
    });
};

async function removeGoalRoles(member, guild, level)
{
    db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
    {
        if (err) throw err;
        if (data.length < 1 || data[0].xp == 0) return;

        for (let i = 0; i < 10; i++)
        {
            const goal = config[0].xpgoals.split(" ")[i];
        
            if (goal != 0)
            {
                const [requiredLevel, roleID] = goal.split("-");
                if (level < requiredLevel && member.roles.cache.has(roleID)) member.roles.remove(roleID);
            };
        };
    });
};

module.exports =
{
    addGoalRoles,
    removeGoalRoles
};