const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports =
{
    name: 'dropxpButton',
    async run(client, db, interaction)
    {
        try
        {
            interaction.message.delete();
            const amountXP = interaction.message.content.match(/\[\d+\]/)[0].replace(/\D/g, ''); // Extract the number in spoiler.

            // Update the XP for this member.
            db.query('SELECT * FROM xp WHERE user = ? AND guild = ?', [interaction.user.id, interaction.guild.id], async (err, data) =>
            {
                let newXP = parseInt(amountXP);
                let currentLevel = 0;

                if (data.length < 1) db.query('INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)', [interaction.user.id, interaction.guild.id, amountXP]);
                else
                {
                    newXP = parseInt(data[0].xp) + parseInt(amountXP);
                    currentLevel = parseInt(data[0].level);
                    db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [newXP, currentLevel, interaction.guild.id, interaction.user.id]);
                };

                let nextLevel = 500 + (currentLevel * 10); // Calculate the next level goal.
                while (newXP >= nextLevel)
                {
                    newXP -= nextLevel; // Update the amount of XP.
                    currentLevel += 1;
                    nextLevel = 500 + (currentLevel * 10); // Calculate the new next level goal.

                    // Update user informations in the database.
                    db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [newXP, currentLevel, interaction.guild.id, interaction.user.id]);
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

            interaction.channel.send({ content: `Claimed by <@${interaction.user.id}> @${interaction.user.username}!`, embeds: [embed], components: [button] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] dropxpButton, ${err}, ${Date.now()}`);
        };
    }
};