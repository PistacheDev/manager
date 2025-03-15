const { db, client } = require("../main");
const { PermissionsBitField, MessageFlags } = require("discord.js");
const Perms = PermissionsBitField.Flags;

const messages = new Map();
const warnings = new Map();

async function antispam(message)
{
    const guild = message.guild;
    const author = message.author;
    const member = message.member;

    db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
    {
        if (err) throw err;
        if (data.length < 1 || data[0].antispam == 0 || author.id == client.user.id || author.id == guild.ownerId || member.permissions.has(Perms.Administrator)) return false;

        const [maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(" ");
        const now = Date.now();
        const timestamps = messages.get(author.id) || [];
        const filter = timestamps.filter(timestamp => now - timestamp < interval * 1000);

        // Add the message to the Map.
        filter.push(now);
        messages.set(author.id, filter);

        if (filter.length >= maxMessages)
        {
            const warns = (warnings.get(author.id) || 0) + 1;
            warnings.set(author.id, warns); // Add the warn to the member's count.

            if (warns > maxWarns) // Too many warns.
            {
                if (sanction == "ban")
                {
                    member.ban({ reason: `[Anti spam] Still spamming after ${warns} warns.` }).then(() =>
                    {
                        message.reply(`:man_judge: @${member.username} (${author.id}) has been banned for spamming!`);
                    });
                }
                else
                {
                    member.timeout(sanction * 60000).then(() =>
                    {
                        message.reply({ content: `:man_judge: You've been muted for ${sanction} minutes for spamming!`, flags: MessageFlags.Ephemeral });
                        warnings.set(author.id, 0);
                    });
                };
            }
            else message.reply(`:warning: This is your warning ${warns}/${maxWarns} for spamming!${warns == maxWarns ? ` Next time, you will be ${sanction == "ban" ? "banned" : "muted"} for spamming!` : ""}`);

            return true;
        };

        return false;
    });

    return false;
};

module.exports =
{
    antispam
};