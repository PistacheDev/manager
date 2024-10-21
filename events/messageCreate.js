const { generateNumber } = require('../functions/numberGenerator');

module.exports =
{
    name: 'messageCreate',
    async run(client, db, message)
    {
        try
        {
            if (message.author.bot || !message.guild || message.content == '') return; // Some verifications to continue.
            if (message.content == `<@${client.user.id}>`) return message.reply(`:wave: Hey <@${message.author.id}>! I\'m online and functionnal!`);

            db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [message.guild.id, message.author.id], async (err, data) =>
            {
                if (data.length < 1) return db.query('INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)', [message.author.id, message.guild.id, generateNumber(15)]);

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