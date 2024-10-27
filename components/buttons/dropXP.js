const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports =
{
    name: 'dropxpButton',
    async run(client, db, interaction)
    {
        try
        {
            // Some shortcuts.
            const guild = interaction.guild;
            const user = interaction.user;

            interaction.message.delete(); // Avoid to give XP to several users.
            const amountXP = interaction.message.content.match(/\[\d+\]/)[0].replace(/\D/g, ''); // Extract the number in the spoiler.

            db.query('SELECT * FROM xp WHERE user = ? AND guild = ?', [user.id, guild.id], async (err, data) =>
            {
                // Some data.
                let newXP = parseInt(amountXP);
                let currentLevel = 0;

                if (data.length < 1) db.query('INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)', [user.id, guild.id, amountXP]);
                else
                {
                    // Update the data if the user is already in the database.
                    newXP = parseInt(data[0].xp) + parseInt(amountXP);
                    currentLevel = parseInt(data[0].level);

                    db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [newXP, currentLevel, guild.id, user.id]);
                };

                // Amount of XP required to level up.
                let nextLevel = 500 + (currentLevel * 10);

                while (newXP >= nextLevel) // Level up while the user has enough XP.
                {
                    // Update the data.
                    newXP -= nextLevel;
                    currentLevel += 1;
                    nextLevel = 500 + (currentLevel * 10);

                    db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, config) =>
                    {
                        for (let i = 0; i < 4; i++)
                        {
                            const goal = config[0].xpgoals.split(' ')[i];

                            if (goal != 0)
                            {
                                const [requiredLevel, roleID] = goal.split('-');

                                if (currentLevel + 1 >= requiredLevel && !interaction.member.roles.cache.has(roleID))
                                {
                                    interaction.member.roles.add(roleID);
                                };
                            };
                        };
                    });

                    db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [newXP, currentLevel, guild.id, user.id]);
                };
            });

            const embed = new EmbedBuilder()
            .setColor('Orange')
            .setDescription(`:tada: The **first person** who click on the **button bellow** will gain **${amountXP} XP points**!`)

            var button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('dropxpButton')
                .setLabel('Claim the reward')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true)
            )

            interaction.channel.send({ content: `Claimed by <@${user.id}> @${user.username}!`, embeds: [embed], components: [button] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] dropxpButton, ${err}, ${Date.now()}`);
        };
    }
};