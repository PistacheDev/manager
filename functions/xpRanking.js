function calculXP(xp, level)
{
    let xpTotal = 0;
    for (let i = 0; i < level; i++) xpTotal += (level - i * 10) * 500; // Convert the levels into XP.

    xpTotal += xp; // Add the remaining amount of XP.
    return xpTotal;
};

module.exports =
{
    calculXP
};