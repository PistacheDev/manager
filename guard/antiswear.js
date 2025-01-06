const { db, client } = require("../main");
const { PermissionsBitField } = require("discord.js");
const detector = require("profanity-check");
const filter = new detector.Filter();
const warnings = new Map();

async function antiswear(message)
{
    const guild = message.guild;
    const author = message.author;
    const member = message.member;

    db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
    {
        if (err) throw err;
        if (data[0].length < 1 || data[0].antiswear == 0) return false;

        const [ignoreBots, ignoreAdmins, maxWarns, sanction] = data[0].antiswear.split(" ");
        if ((author.bot && ignoreBots == 1) || (member.permissions.has(PermissionsBitField.Flags.Administrator) && ignoreAdmins == 1)) return false;
        if (author.id == client.user.id || author.id == guild.ownerId) return false;

        if (filter.isProfane(message.content)) // If a bad word has been detected.
        {
            message.delete();
            const warnsCount = (warnings.get(author.id) || 0) + 1;
            warnings.set(author.id, warnsCount); // Add the warn to the member's count.

            if (warnsCount > maxWarns)
            {
                if (sanction == "ban")
                {
                    member.ban({ reason: `[Anti swear] Still being unpolite after ${warnsCount}/${maxWarns} warns.` }).then(() =>
                    {
                        message.channel.send(`:man_judge: @${member.username} (*${author.id}*) has been banned for being unpolite!`);
                    });
                }
                else
                {
                    member.timeout(sanction * 60000).then(() =>
                    {
                        message.channel.send(`:man_judge: <@${author.id}> has been muted for ${sanction} minutes for being unpolite!`);
                        warnings.set(author.id, 0);
                    });
                };
            }
            else message.channel.send(`:warning: <@${author.id}>, this is your warning ${warnsCount}/${maxWarns} for being unpolite!${warnsCount == maxWarns ? ` Next time, you will be ${sanction == "ban" ? "ban" : "mute"} for being unpolite!` : ""}`);

            return true;
        };
    });
};

module.exports =
{
    antiswear
};