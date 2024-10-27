const { PermissionsBitField } = require('discord.js');
const Perms = PermissionsBitField.Flags;
const { generateNumber } = require('../functions/numberGenerator');
const url = require('../URL.json');

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

            // Some security verifications.
            const isSpamming = antiSpam();
            if (isSpamming) return;
            const containLink = antiLinks();
            if (containLink) return;

            if (message.content == `<@${client.user.id}>`) message.reply(`:wave: Hey <@${message.author.id}>! I\'m online and functionnal!`);
            xp(); // XP system.

            function antiSpam()
            {
                db.query('SELECT * FROM config WHERE guild = ?', [message.guild.id], async (err, data) =>
                {
                    if (data.length < 1 || data[0].antispam == 0) return false; // Some database verifications.
                    const [ignoreBots, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(' ');

                    // Some verifications.
                    if (ignoreBots == 1 && message.author.bot) return false;
                    if (message.author.id == client.user.id) return false;
                    if (message.author.id == message.guild.ownerId || message.member.permissions.has(Perms.Administrator)) return false;

                    // Some data.
                    const now = Date.now();
                    const timestamps = messages.get(message.author.id) || [];
                    const filter = timestamps.filter(timestamp => now - timestamp < interval * 1000);

                    // Add the message to the Map.
                    filter.push(now);
                    messages.set(message.author.id, filter);

                    if (filter.length >= maxMessages)
                    {
                        const warns = (warnings.get(message.author.id) || 0) + 1;
                        warnings.set(message.author.id, warns); // Add the warn to the member's count.

                        if (warns > maxWarns) // Too many warns.
                        {
                            if (sanction == 'ban')
                            {
                                message.member.ban({ reason: `[Anti spam] Still spamming after ${warns} warns.` }).then(() =>
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
                            // Last warn.
                            if (warns == maxWarns) message.channel.send(`:man_judge: Next time, you **will be ${sanction == 'ban' ? 'banned' : 'muted'}** for spamming!`);
                        };

                        return true;
                    };
                });
            };

            function antiLinks()
            {
                db.query('SELECT * FROM config WHERE guild = ?', [message.guild.id], async (err, data) =>
                {
                    // Some verifications.
                    if (data.length < 1 || data[0].antilinks == 0) return false;
                    if (data[0].antilinks == 1 && message.author.bot) return false;
                    if (message.author.id == client.user.id) return false;
                    if (message.author.id == message.guild.ownerId || message.member.permissions.has(Perms.Administrator)) return false;

                    const content = message.content.toLowerCase(); // Convert the text in lower cases.
                    const containLink = url.keywords.some(keyword => content.includes(keyword)); // Search any URL keywords in the text.

                    if (containLink)
                    {
                        message.delete().then(() =>
                        {
                            message.channel.send(`:warning: <@${message.author.id}>, links aren\'t allowed in this server!`);
                            return true;
                        });
                    };
                });
            };

            function xp()
            {
                db.query('SELECT * FROM config WHERE guild = ?', [message.guild.id], async (err, config) =>
                {
                    if (config.length < 1 || config[0].xp == 0) return;

                    db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [message.guild.id, message.author.id], async (err, data) =>
                    {
                        if (data.length < 1)
                        {
                            db.query('INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)', [message.author.id, message.guild.id, generateNumber(15)]);
                            return;
                        };

                        // Some data.
                        const [alert, maxXP, maxLevel] = config[0].xp.split(' ');
                        let currentXP = parseInt(data[0].xp) + generateNumber(maxXP);
                        let currentLevel = parseInt(data[0].level);

                        if (maxLevel > currentLevel && 500 + (currentLevel * 10) <= currentXP) // Level up the user if he has enough XP to pass to the next level.
                        {
                            currentXP = currentXP - (500 + (currentLevel * 10));

                            db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [currentXP, currentLevel + 1, message.guild.id, message.author.id]);
                            if (alert == 1) message.channel.send(`:tada: Congratulation <@${message.author.id}> @${message.author.username}! You just passed to **level ${currentLevel + 1}**!`);

                            for (let i = 0; i < 4; i++)
                            {
                                const goal = config[0].xpgoals.split(' ')[i];

                                if (goal != 0)
                                {
                                    const [requiredLevel, roleID] = goal.split('-');

                                    if (currentLevel + 1 >= requiredLevel && !message.member.roles.cache.has(roleID))
                                    {
                                        message.member.roles.add(roleID);
                                    };
                                };
                            };
                        } else db.query('UPDATE xp SET xp = ? WHERE guild = ? AND user = ?', [currentXP, message.guild.id, message.author.id]); // Just update the amount of XP if the user doesn't have to level-up.
                    });
                });
            };
        }
        catch (err)
        {
            message.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] messageCreate, ${err}, ${Date.now()}`);
        };
    }
};