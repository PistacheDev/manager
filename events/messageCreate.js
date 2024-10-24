const { PermissionsBitField } = require('discord.js');
const { generateNumber } = require('../functions/numberGenerator');

// Some Maps for the anti spam.
const messages = new Map();
const warnings = new Map();

module.exports =
{
    name: 'messageCreate',
    async run(client, db, message)
    {
        try
        {
            if (message.author.bot || !message.guild || message.content == '') return; // Some verifications to continue.

            const isSpamming = antiSpam(message, db, client);
            if (isSpamming) return;
            if (message.content == `<@${client.user.id}>`) message.reply(`:wave: Hey <@${message.author.id}>! I\'m online and functionnal!`);

            db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [message.guild.id, message.author.id], async (err, data) =>
            {
                if (data.length < 1)
                {
                    db.query('INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)', [message.author.id, message.guild.id, generateNumber(15)]);
                    return;
                };

                const currentXP = parseInt(data[0].xp);
                const currentLevel = parseInt(data[0].level);
                let newXP = currentXP + generateNumber(15); // New amount of XP.

                // Level-up the user if he has enough XP to pass to the next level.
                if (500 + (currentLevel * 10) <= newXP)
                {
                    newXP = newXP - (500 + (currentLevel * 10)); // Remove the next level requirement of XP.
                    db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [newXP, currentLevel + 1, message.guild.id, message.author.id]);
                    message.channel.send(`:tada: Congratulation <@${message.author.id}> @${message.author.username}! You just passed to **level ${currentLevel + 1}**!`);
                } else db.query('UPDATE xp SET xp = ?, WHERE guild = ? AND user = ?', [newXP, message.guild.id, message.author.id]); // Just update the amount of XP if the user doesn't have to level-up.
            });
        }
        catch (err)
        {
            message.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] messageCreate, ${err}, ${Date.now()}`);
        };
    }
};

function antiSpam(message, db, client)
{
    db.query('SELECT * FROM config WHERE guild = ?', [message.guild.id], async (err, data) =>
    {
        if (data.length < 1 || data[0].antispam == 'false') return null;
        const [_, ignoreBots, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(' ');

        if (ignoreBots == 'true' && message.author.bot) return null;
        if (message.author.id == client.user.id) return null;
        if (message.author.id == message.guild.ownerId || message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return null;

        const now = Date.now();
        const timestamps = messages.get(message.author.id) || [];
        const filter = timestamps.filter(timestamp => now - timestamp < interval * 1000);

        if (filter.length >= maxMessages)
        {
            const warns = (warnings.get(message.author.id) || 0) + 1;
            warnings.set(message.author.id, warns);

            if (warns > maxWarns)
            {
                if (sanction == 'ban')
                {
                    message.member.ban({ reason: `[Anti spam] Still continue spamming after ${warns} warns.` }).then(() =>
                    {
                        message.reply(`:man_judge: @${message.member.username} (${message.author.id}) has been **banned for spamming**!`);
                    });
                }
                else
                {
                    message.member.timeout(sanction * 60000).then(() =>
                    {
                        message.reply(`:man_judge: You've been **muted for ${sanction} minutes** for spamming!`);
                        warnings.set(message.author.id, 0);
                    });
                };
            }
            else
            {
                message.reply(`:warning: This is your **warning ${warns}/${maxWarns}** for spamming!`);
                if (warns == maxWarns) message.channel.send(`:man_judge: Next time, you **will be ${sanction == 'ban' ? 'banned' : 'muted'}** for spamming!`);
            };

            return true;
        };

        filter.push(now);
        messages.set(message.author.id, filter);
    });
};