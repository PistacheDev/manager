const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'xpSettingsModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const alert = interaction.fields.getTextInputValue('xpSettingsModalOption');
            const maxXP = interaction.fields.getTextInputValue('xpSettingsModalOption2');
            const maxLevel = interaction.fields.getTextInputValue('xpSettingsModalOption3');
            const guild = interaction.guild;

            if (alert != 'yes' && alert != 'no') return interaction.reply(':warning: Your answer for the **alert** option is invalid!');
            if (maxLevel && isNaN(maxXP) && isNaN(maxLevel)) return interaction.reply(':warning: Please, enter a **number**!');
            if (maxLevel > 100 || maxLevel < 10) return interaction.reply(':warning: The maximum level must be **between 10 and 100**!');
            if (maxXP > 50 || maxXP < 1) return interaction.reply(':warning: The maximum amount of XP must be **between 1 and 50**!');

            db.query('UPDATE config SET xp = ? WHERE guild = ?', [`${alert == 'yes' ? 1 : 0} ${maxXP} ${maxLevel}`, guild.id], async (err) =>
            {
                if (err) throw err;

                db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, config) =>
                {
                    if (err) throw err;
                    let goals = '';

                    for (let i = 0; i < 4; i++) // Fetch and load every goals.
                    {
                        const goal = config[0].xpgoals.split(' ')[i];
                        if (goal != 0) goals = `${goals}**Goal ${i + 1}/4**: Level ${goal.split('-')[0]} ➜ <@&${goal.split('-')[1]}>.${i < 3 ? '\n' : ''}`;
                        else goals = `${goals}**Goal ${i + 1}/4**: Not configured.${i < 3 ? '\n' : ''}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                    .addFields([{ name: ':gear:・XP system:', value: `>>> **Status**: :white_check_mark: Active.\n**Alert when level up**: ${alert == 'yes' ? 'Yes' : 'No'}.\n**XP per message**: Between 1 and ${maxXP}.\n**Maximum Level**: Level ${maxLevel ? maxLevel : 100}.\n**Function**: Set the **application behavior** in the XP system.` }])
                    .addFields([{ name: ':trophy:・Goals:', value: `>>> ${goals}\n**Function**: When a member **reach a certain level**, the application **give a role**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();

                    db.query('SELECT * FROM xp WHERE guild = ?', [guild.id], async (err, data) =>
                    {
                        if (err) throw err;
                        if (data.length < 1) return;

                        for (let i = 0; i < data.length; i++)
                        {
                            const userData = data[i];
                            let currentXP = parseInt(userData.xp);
                            let currentLevel = parseInt(userData.level);

                            if (currentLevel > maxLevel) // If the user level is greater than the new max level.
                            {
                                const difference = currentLevel - maxLevel; // Calculate how many times the loop has to execute.

                                for (let n = 0; n < difference; n++) // Convert the levels in XP points.
                                {
                                    currentLevel -= 1;
                                    currentXP += 500 + (currentLevel * 10);
                                };

                                db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [currentXP, currentLevel, guild.id, userData.user], async (err) =>
                                {
                                    if (err) throw err;
                                });
                            };
                        };
                    });
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] xpSettingsModal, ${err}, ${Date.now()}`);
        };
    }
};