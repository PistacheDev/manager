const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'xpSettingsModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            // Modal options.
            const alert = interaction.fields.getTextInputValue('xpSettingsModalOption');
            const maxXP = interaction.fields.getTextInputValue('xpSettingsModalOption2');
            const maxLevel = interaction.fields.getTextInputValue('xpSettingsModalOption3');

            // Some shortcuts.
            const guild = interaction.guild;

            // Some verifications.
            if (alert != 'yes' && alert != 'no') return interaction.reply(':warning: Your answer for the **alert** option is invalid!');
            if (maxLevel && isNaN(maxXP) && isNaN(maxLevel)) return interaction.reply(':warning: Please, enter a **number**!');
            if (maxLevel > 100 || maxLevel < 10) return interaction.reply(':warning: The maximum level must be **between 10 and 100**!');
            if (maxXP > 50 || maxXP < 1) return interaction.reply(':warning: The maximum amount of XP must be **between 1 and 50**!');

            db.query('UPDATE config SET xp = ? WHERE guild = ?', [`${alert == 'yes' ? 1 : 0} ${maxXP} ${maxLevel}`, guild.id], async () =>
            {
                db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
                {
                    let goals = '';

                    for (let i = 0; i < 4; i++) // Fetch and load every goals.
                    {
                        const goal = data[0].xpgoals.split(' ')[i];
                        if (goal != 0) goals = `${goals}**Goal ${i + 1}/4**: Level ${goal.split('-')[0]} ➜ <@&${goal.split('-')[1]}>.${i < 3 ? '\n' : ''}`;
                        else goals = `${goals}**Goal ${i + 1}/4**: Not configured.${i < 3 ? '\n' : ''}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                    .addFields([{ name: ':gear:・XP system:', value: `>>> **Status**: :white_check_mark: Active.\n**Alert when level up**: ${alert == 'yes' ? 'Yes' : 'No'}.\n**XP per message**: Between 1 and ${maxXP}.\n**Maximum Level**: Level ${maxLevel ? maxLevel : 100}.\n**Function**: Set the **application behavior** in the XP system.` }])
                    .addFields([{ name: ':trophy:・Goals:', value: `>>> ${goals}\n**Function**: When a member **reach a certain level**, the application **give a role**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
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