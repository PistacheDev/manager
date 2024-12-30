const { generateNumber } = require("../functions/numberGenerator");
const { antilinks } = require("../guard/antilinks");
const { antispam } = require("../guard/antispam");
const { antipings } = require("../guard/antipings");
const { antiswear } = require("../guard/antiswear");
const { bansdef } = require("../guard/bansdef");

module.exports =
{
    name: "messageCreate",
    async run(client, db, message)
    {
        try
        {
            if (!message.guild || message.content == "" || message.author.id == client.user.id) return;

            const guild = message.guild;
            const author = message.author;
            const member = message.member;

            const isBanned = await bansdef(message);
            const isInsulting = await antiswear(message);
            const isSpamming = await antispam(message);
            const containLinks = await antilinks(message);
            const forbiddenPing = await antipings(message);

            if (isBanned || isInsulting || isSpamming || containLinks || forbiddenPing) return;
            if (message.author.bot) return;
            if (message.content == `<@${client.user.id}>`) return message.reply(`:wave: Hey <@${author.id}>! I'm online and functionnal!`);

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                if (config.length < 1 || config[0].xp == 0) return;

                db.query("SELECT * FROM xp WHERE guild = ? AND user = ?", [guild.id, author.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1)
                    {
                        db.query("INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)", [author.id, guild.id, generateNumber(15)], async (err) =>
                        {
                            if (err) throw err;
                            return;
                        });
                    };

                    const [alert, maxXP, maxLevel] = config[0].xp.split(" ");
                    let currentXP = parseInt(data[0].xp) + generateNumber(maxXP);
                    let currentLevel = parseInt(data[0].level);

                    if (maxLevel > currentLevel && 500 + (currentLevel * 10) <= currentXP) // Level up the user if he has enough XP to pass to the next level.
                    {
                        currentXP = currentXP - (500 + (currentLevel * 10));
                        db.query("UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?", [currentXP, currentLevel + 1, guild.id, author.id], async (err) =>
                        {
                            if (err) throw err;
                        });

                        if (alert == 1) message.channel.send(`:tada: Congratulation <@${author.id}> @${author.username}! You just passed to **level ${currentLevel + 1}**!`);
                        for (let i = 0; i < 4; i++)
                        {
                            const goal = config[0].xpgoals.split(" ")[i];

                            if (goal != 0)
                            {
                                const [requiredLevel, roleID] = goal.split("-");

                                if (currentLevel + 1 >= requiredLevel && !member.roles.cache.has(roleID))
                                {
                                    member.roles.add(roleID);
                                };
                            };
                        };
                    }
                    else
                    {
                        db.query("UPDATE xp SET xp = ? WHERE guild = ? AND user = ?", [currentXP, guild.id, author.id], async (err) =>
                        {
                            if (err) throw err;
                        });
                    };
                });
            });
        }
        catch (err)
        {
            message.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] messageCreate, ${err}, ${Date.now()}`);
        };
    }
};