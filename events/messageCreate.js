const { MessageFlags } = require("discord.js");
const { generateNumber } = require("../functions/numberGenerator");
const { antilinks } = require("../guard/antilinks");
const { antispam } = require("../guard/antispam");
const { antipings } = require("../guard/antipings");
const { antiswear } = require("../guard/antiswear");
const { bansdef } = require("../guard/bansdef");
const { levelUp } = require("../functions/levels");

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
            if (message.content == `<@${client.user.id}>`) return message.reply({ content: `:wave: Hey <@${author.id}>! I'm online and functionnal!`, flags: MessageFlags.Ephemeral });

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
                    const xp = parseInt(data[0].xp) + generateNumber(maxXP);
                    const level = parseInt(data[0].level);

                    if (maxLevel > level && 500 + (level * 10) <= xp) // Check if the user can level up.
                    {
                        levelUp(guild, member, level, maxLevel, xp);
                        if (alert == 1) message.reply({ content: `:tada: Congratulation <@${author.id}> @${author.username}! You just passed to **level ${level + 1}**!`, flags: MessageFlags.Ephemeral });
                    }
                    else
                    {
                        db.query("UPDATE xp SET xp = ? WHERE guild = ? AND user = ?", [xp, guild.id, author.id], async (err) =>
                        {
                            if (err) throw err;
                        });
                    };
                });
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};