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
            if (message.author.bot || !message.guild || message.content == '') return;

            const guild = message.guild;
            const author = message.author;
            const member = message.member;

            const isSpamming = antiSpam();
            if (isSpamming) return;
            const containLink = antiLinks();
            if (containLink) return;
            const usedForbiddenPing = pingCheck();
            if (usedForbiddenPing) return;

            if (message.content == `<@${client.user.id}>`) message.reply(`:wave: Hey <@${author.id}>! I\'m online and functionnal!`);
            xp(); // XP system.

            function antiSpam()
            {
                db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1 || data[0].antispam == 0) return false;
                    const [ignoreBots, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(' ');

                    if (ignoreBots == 1 && author.bot) return false;
                    if (author.id == client.user.id) return false;
                    if (author.id == guild.ownerId || member.permissions.has(Perms.Administrator)) return false;

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
                            if (sanction == 'ban')
                            {
                                member.ban({ reason: `[Anti spam] Still spamming after ${warns} warns.` }).then(() =>
                                {
                                    message.reply(`:man_judge: @${member.username} (${author.id}) has been **banned for spamming**!`);
                                });
                            }
                            else
                            {
                                member.timeout(sanction * 60000).then(() =>
                                {
                                    message.reply(`:man_judge: You've been **muted for ${sanction} minutes** for spamming!`);
                                    warnings.set(author.id, 0);
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

                    return false;
                });
            };

            function antiLinks()
            {
                db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1 || data[0].antilinks == 0) return false;
                    if (data[0].antilinks == 1 && author.bot) return false;
                    if (author.id == client.user.id) return false;
                    if (author.id == guild.ownerId || member.permissions.has(Perms.Administrator)) return false;

                    const content = message.content.toLowerCase(); // Convert the text in lower cases.
                    const containLink = url.keywords.some(keyword => content.includes(keyword)); // Search any URL keywords in the text.

                    if (containLink)
                    {
                        message.delete().then(() =>
                        {
                            message.channel.send(`:warning: <@${author.id}>, links aren\'t allowed in this server!`);
                            return true;
                        });
                    };

                    return false;
                });
            };

            function pingCheck()
            {
                db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data[0].length < 1 || data[0].antipings == 0) return false;
                    const [ignoreBots, sanction] = data[0].antipings;

                    if (ignoreBots == 1 && author.bot) return false;
                    if (author.id == client.user.id) return false;
                    if (author.id == guild.ownerId || member.permissions.has(Perms.Administrator)) return false;

                    if (message.content.includes('@everyone' || '@here'))
                    {
                        message.delete();
                        const mention = message.content.includes('@everyone') ? 'everyone' : 'here';

                        if (sanction == 'ban')
                        {
                            member.ban({ reason: `Anti pings enabled!` }).then(() =>
                            {
                                message.channel.send(`:man_judge: @${member.username} (${author.id}) has been **banned for using the ${mention} mention**!`);
                            });
                        }
                        else
                        {
                            member.timeout(sanction * 60000).then(() =>
                            {
                                message.channel.send(`:man_judge: <@${author.id}>, you've been **muted for ${sanction} minutes** for using the ${mention} mention!`);
                            });
                        };

                        return true;
                    };

                    return false;
                });
            };

            function xp()
            {
                db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, config) =>
                {
                    if (err) throw err;
                    if (config.length < 1 || config[0].xp == 0) return;

                    db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [guild.id, author.id], async (err, data) =>
                    {
                        if (err) throw err;
                        if (data.length < 1)
                        {
                            db.query('INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)', [author.id, guild.id, generateNumber(15)], async (err) =>
                            {
                                if (err) throw err;
                                return;
                            });
                        };

                        const [alert, maxXP, maxLevel] = config[0].xp.split(' ');
                        let currentXP = parseInt(data[0].xp) + generateNumber(maxXP);
                        let currentLevel = parseInt(data[0].level);

                        if (maxLevel > currentLevel && 500 + (currentLevel * 10) <= currentXP) // Level up the user if he has enough XP to pass to the next level.
                        {
                            currentXP = currentXP - (500 + (currentLevel * 10));
                            db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [currentXP, currentLevel + 1, guild.id, author.id], async (err) =>
                            {
                                if (err) throw err;
                            });

                            if (alert == 1) message.channel.send(`:tada: Congratulation <@${author.id}> @${author.username}! You just passed to **level ${currentLevel + 1}**!`);
                            for (let i = 0; i < 4; i++)
                            {
                                const goal = config[0].xpgoals.split(' ')[i];

                                if (goal != 0)
                                {
                                    const [requiredLevel, roleID] = goal.split('-');

                                    if (currentLevel + 1 >= requiredLevel && !member.roles.cache.has(roleID))
                                    {
                                        member.roles.add(roleID);
                                    };
                                };
                            };
                        }
                        else
                        {
                            db.query('UPDATE xp SET xp = ? WHERE guild = ? AND user = ?', [currentXP, guild.id, author.id], async (err) =>
                            {
                                if (err) throw err;
                            });
                        };
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