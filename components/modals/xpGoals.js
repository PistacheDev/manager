const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'xpGoalsModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            // Modal options.
            const goal = interaction.fields.getTextInputValue('xpGoalsModalOption');
            const level = interaction.fields.getTextInputValue('xpGoalsModalOption2')
            const roleID = interaction.fields.getTextInputValue('xpGoalsModalOption3');

            // Some  shortcuts.
            const guild = interaction.guild;

            // Some verifications.
            if (isNaN(goal) || isNaN(level)) return interaction.reply(':warning: Please, enter a **number**!');
            if (goal < 1 || goal > 4) return interaction.reply(':warning: The goal must be **between 1 and 4**!');
            if (level < 10 || level > 100) return interaction.reply(':warning: The level must be **between 10 and 100**!');
            if (roleID && !guild.roles.cache.get(roleID)) return interaction.reply(':warning: This role **doesn\'t exist**!');

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data[0].xp == 0) return interaction.reply(':warning: The XP system is **disabled** in this server!');
                const xpGoals = data[0].xpgoals.split(' ');

                // Update the targeted data.
                if (roleID) xpGoals[goal - 1] = `${level}-${roleID}`;
                else xpGoals[goal - 1] = 0;

                db.query(`UPDATE config SET xpgoals = ? WHERE guild = ?`, [`${xpGoals[0]} ${xpGoals[1]} ${xpGoals[2]} ${xpGoals[3]}`, guild.id], async (err) =>
                {
                    if (err) throw err;

                    // Some data.
                    let status = ':x: Inactive';
                    let goals = '';

                    if (data[0].xp != 0) // Update the data if the option is enabled.
                    {
                        const [sendMessages, maxXP, maxLevel] = data[0].xp.split(' ');
                        status = `:white_check_mark: Active.\n**Alert when level up**: ${sendMessages == 0 ? 'No' : 'Yes'}.\n**XP per message**: Between 1 and ${maxXP}.\n**Maximum Level**: ${maxLevel == 0 ? 'None' : `Level ${maxLevel}`}`;
                    };

                    for (let i = 0; i < 4; i++) // Fetch and load every goals.
                    {
                        const goal = xpGoals[i];
                        if (goal != 0) goals = `${goals}**Goal ${i + 1}/4**: Level ${goal.split('-')[0]} ➜ <@&${goal.split('-')[1]}>.${i < 3 ? '\n' : ''}`;
                        else goals = `${goals}**Goal ${i + 1}/4**: Not configured.${i < 3 ? '\n' : ''}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                    .addFields([{ name: ':gear:・XP system:', value: `>>> **Status**: ${status}.\n**Function**: Set the **application behavior** in the XP system.` }])
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
            console.error(`[error] xpGoalsModal, ${err}, ${Date.now()}`);
        };
    }
};