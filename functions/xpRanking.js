function calculXP(xp, level)
{
    let xpTotal = 0;

    for (let i = 0; i < level; i++)
    {
        xpTotal += (parseInt(level) - i * 10) * 500;
    };

    xpTotal += parseInt(xp);
    return xpTotal;
};

module.exports =
{
    calculXP
};