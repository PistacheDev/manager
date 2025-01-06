const { db, client } = require("../main");
const { PermissionsBitField, MessageFlags } = require("discord.js");

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
        if (data.length < 1 || data[0].antispam == 0) return false;

        const [ignoreBots, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(" ");
        if (ignoreBots == 1 && author.bot) return false;
        if (author.id == client.user.id || author.id == guild.ownerId || member.permissions.has(PermissionsBitField.Flags.Administrator)) return false;

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
            else message.reply(`:warning: This is your warning ${warns}/${maxWarns} for spamming!\n${warns == maxWarns ? ` Next time, you will be ${sanction == "ban" ? "ban" : "mute"} for spamming!` : ""}`);

            return true;
        };

        return false;
    });
};

module.exports =
{
    antispam
};