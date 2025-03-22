function generateString(length)
{
    if (length < 1) throw "the length is too short for the generation!";
    if (length > 100) throw "the length is too long for the generation!";

    let generatedID = [];
    const string = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"];

    for (let rep = 0; rep < 20; rep++)
    {
        generatedID.push(string[Math.floor(Math.random() * string.length)]);
    };

    return generatedID.join("");
};

function generateNumber(length)
{
    const number = Math.floor(Math.random() * length) + 1;
    return number;
};

module.exports =
{
    generateString,
    generateNumber
};