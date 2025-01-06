const { db } = require("../main");
const { addGoalRoles, removeGoalRoles } = require("./xpGoals");

async function levelUp(guild, member, levelDepart, maxLevel, xp)
{
    let XP = xp;
    let level = levelDepart;
    let nextLevel = 500 + (level * 10);
    let loop = 0;

    while (XP >= nextLevel && loop < 3) // Level up while the user has enough XP.
    {
        XP -= nextLevel;
        level += 1;
        nextLevel = 500 + (level * 10);
        loop += 1;
        if (level > maxLevel) level = maxLevel

        db.query("UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?", [XP, level, guild.id, member.id], async (err) =>
        {
            if (err) throw err;
        });

        addGoalRoles(member, guild, level);
        if (level == maxLevel) break; // Stop level up the user if he reached the max level.
    };
};

async function levelDown(guild, member, levelDepart, xp)
{
    let XP = xp;
    let level = levelDepart;
    let previous = 500 + ((currentLevel - 1) * 10);
    let loop = 0; // To avoid to create an infinite loop.

    while (XP < 0 && loop < 3) // Level down the user while his amount of XP is negative.
    {
        XP += previous;
        level -= 1;
        previous = 500 + ((level - 1) * 10);
        loop += 1;

        if (level < 0)
        {
            level = 0;
            XP = 0;
        };

        db.query("UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?", [XP, level, guild.id, member.id], async (err) =>
        {
            if (err) throw err;
        });

        removeGoalRoles(member, guild, level);
        if (level == 0 && XP == 0) break; // Stop level down the user if it's now impossible.
    };
};

module.exports =
{
    levelUp,
    levelDown
};