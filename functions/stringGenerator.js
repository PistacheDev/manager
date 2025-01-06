function generateString()
{
    let generatedID = [];
    const string = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"]; // Every available characters for the generation.

    for (let rep = 0; rep < 20; rep++) generatedID.push(string[Math.floor(Math.random() * string.length)]); // Take a random character and add it to the list.
    return generatedID.join(""); // Transform the list into a simple string.
};

module.exports =
{
    generateString
};