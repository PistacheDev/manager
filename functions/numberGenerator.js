function generateNumber(length)
{
    const randomNumber = Math.floor(Math.random() * length) + 1;
    return randomNumber;
};

module.exports =
{
    generateNumber
};