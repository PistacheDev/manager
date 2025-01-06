const { db, client } = require("../main");
const { PermissionsBitField, MessageFlags } = require("discord.js");
const url = require("../json/url.json");

async function antilinks(message)
{
    const guild = message.guild;
    const author = message.author;
    const member = message.member;

    db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
    {
        if (err) throw err;
        if (data.length < 1 || data[0].antilinks == 0 || author.id == client.user.id) return false;
        if (data[0].antilinks == 1 && author.bot || author.id == guild.ownerId || member.permissions.has(PermissionsBitField.Flags.Administrator)) return false;

        const content = message.content.toLowerCase();
        const isGif = content.includes("tenor.com");
        let occurences = 0;

        url.keywords.forEach(keyword =>
        {
            const count = content.split(keyword).length - 1; // Count the number of occurrences.
            occurences += count;
        });

        if (occurences > 0 && (!isGif || isGif && occurences > 1))
        {
            message.reply({ content: `:warning: <@${author.id}>, links aren't allowed in this server!`, flags: MessageFlags.Ephemeral });
            message.delete();
            return true;
        };

        return false;
    });
};

module.exports =
{
    antilinks
};