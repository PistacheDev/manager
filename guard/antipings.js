const { db, client } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;

async function antipings(message)
{
    const guild = message.guild;
    const author = message.author;
    const member = message.member;

    db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
    {
        if (err) throw err;
        if (data[0].length < 1 || data[0].antipings == 0 || author.id == client.user.id || author.id == guild.ownerId || member.permissions.has(Perms.Administrator)) return false;
        const sanction = data[0].antipings;

        if (message.content.includes("@everyone" || "@here"))
        {
            message.delete();
            const mention = message.content.includes("@everyone") ? "everyone" : "here";

            if (sanction == "ban")
            {
                member.ban({ reason: `Anti pings enabled!` }).then(() =>
                {
                    message.channel.send(`:man_judge: @${member.username} (*${author.id}*) has been banned for using the ${mention} mention!`);
                });
            }
            else
            {
                member.timeout(sanction * 60000).then(() =>
                {
                    message.channel.send(`:man_judge: <@${author.id}> has been muted for ${sanction} minutes for using the ${mention} mention!`);
                });
            };

            return true;
        };

        return false;
    });

    return false;
};

module.exports =
{
    antipings
};