const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports =
{
    name: 'xpadmin',
    type: 'management',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            // Command option.
            var target = interaction.options.getUser('user');
            if (!target) target = interaction.member; // Select the current user if nothing is specified.
            target = guild.members.cache.get(target.id); // Fetch the user in the server list.

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, config) =>
            {
                if (err) throw err;
                if (config.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');
                if (config[0].xp == 0) return interaction.reply(':warning: The XP system is **disabled** in this server!');

                // Check what subcommand has been executed.
                switch (interaction.options.getSubcommand())
                {
                    case 'give':
                        giveXP();
                        break;

                    case 'remove':
                        removeXP();
                        break;

                    case 'clear':
                        clearXP();
                        break;

                    case 'drop':
                        dropXP();
                        break;

                    default:
                        interaction.reply(':warning: Unknown **command**!');
                        break;
                };
            });

            function giveXP()
            {
                // Command option.
                const xpToGive = interaction.options.getNumber('amount');

                db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [guild.id, target.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (xpToGive > 1000 || xpToGive < 1) return interaction.reply(':warning: You can\'t give **more than 1000 XP points** and **less than 1 XP point** per giveaway!');
                    if (data.length < 1)
                    {
                        db.query('INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)', [target.id, guild.id, 0], async (err) =>
                        {
                            if (err) throw err;
                            await new Promise(resolve => setTimeout(resolve, 100)); // Wait to let the database correctly insert the data.
                        });
                    };

                    db.query('UPDATE xp SET xp = ? WHERE guild = ? AND user = ?', [xpToGive + parseInt(data[0].xp), guild.id, target.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.reply(`:white_check_mark: **${xpToGive} XP points** were gave to <@${target.id}>!`);

                        // Some data.
                        let currentXP = parseInt(xpToGive + parseInt(data[0].xp));
                        let currentLevel = parseInt(data[0].level);
                        let nextLevel = 500 + (currentLevel * 10);
                        let loop = 0; // To avoid to create an infinite loop.

                        while (currentXP >= nextLevel && loop < 10) // Level up while the user has enough XP.
                        {
                            // Update the data.
                            currentXP -= nextLevel;
                            currentLevel += 1;
                            nextLevel = 500 + (currentLevel * 10);
                            loop += 1;

                            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, config) =>
                            {
                                if (err) throw err;

                                for (let i = 0; i < 4; i++)
                                {
                                    const goal = config[0].xpgoals.split(' ')[i];
            
                                    if (goal != 0)
                                    {
                                        const [requiredLevel, roleID] = goal.split('-');

                                        if (currentLevel >= requiredLevel && !target.roles.cache.has(roleID))
                                        {
                                            target.roles.add(roleID);
                                        };
                                    };
                                };
                            });

                            db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [currentXP, currentLevel, guild.id, target.id], async (err) =>
                            {
                                if (err) throw err;
                            });
                        };
                    });
                });
            };

            function removeXP()
            {
                // Command option.
                const xpToRemove = interaction.options.getNumber('amount');

                db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [guild.id, target.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1) return interaction.reply(':warning: This user **doesn\'t have** any XP!');
                    if (xpToRemove > 1000 || xpToRemove < 1) return interaction.reply(':warning: You can\'t remove **more than 1000 XP points** and **less than 1 XP point** per sanction!');

                    db.query('UPDATE xp SET xp = ? WHERE guild = ? AND user = ?', [parseInt(data[0].xp) - xpToRemove, guild.id, target.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.reply(`:white_check_mark: **${xpToRemove} XP points** were removed from <@${target.id}>!`);

                        // Some data.
                        let currentXP = parseInt(parseInt(data[0].xp) - xpToRemove);
                        let currentLevel = parseInt(data[0].level);
                        let previousLevel = 500 + ((currentLevel - 1) * 10);
                        let loop = 0; // To avoid to create an infinite loop.

                        while (currentXP < 0 && loop < 10) // Level down the user while his amount of XP is negative.
                        {
                            // Update the data.
                            currentXP += previousLevel;
                            currentLevel -= 1;
                            previousLevel = 500 + ((currentLevel - 1) * 10);
                            loop += 1;

                            db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [currentXP, currentLevel, guild.id, target.id], async (err) =>
                            {
                                if (err) throw err;
                                loop = 10; // Stop the loop.
                            });
                        };
                    });
                });
            };

            function clearXP()
            {
                db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [guild.id, target.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1) return interaction.reply(':warning: This user **doesn\'t have** any XP!');

                    db.query('DELETE FROM xp WHERE guild = ? AND user = ?', [guild.id, target.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.reply(`:white_check_mark: **${data[0].level} levels** and **${data[0].xp} XP points** of <@${target.id}> were deleted successfully!`);
                    });
                });
            };

            function dropXP()
            {
                // Command option.
                const amountXP = interaction.options.getNumber('amount');
                if (amountXP > 1000 || amountXP < 1) return interaction.reply(':warning: You can\'t drop **more than 1000 XP points** and **less than 1 XP point**!');

                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`:tada: The **first person** who click on the **button bellow** will gain **${amountXP} XP points**!`)

                var button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('dropxpButton')
                    .setLabel('Claim the reward')
                    .setStyle(ButtonStyle.Success)
                )

                interaction.reply({ content: `||[${amountXP}]||`, embeds: [embed], components: [button] });
            };
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] xpadmin ${interaction.options.getSubcommand()}, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Admin experience dedicated commands.')
        .addSubcommand(
            cmd => cmd
            .setName('give')
            .setDescription('Give XP points to a member.')
            .addUserOption(
                opt => opt
                .setName('user')
                .setDescription('Member who will receive the XP.')
                .setRequired(true)
            ).addNumberOption(
                opt => opt
                .setName('amount')
                .setDescription('Amount of XP to give.')
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName('remove')
            .setDescription('Remove XP points to a member.')
            .addUserOption(
                opt => opt
                .setName('user')
                .setDescription('User who will lost the XP.')
                .setRequired(true)
            ).addNumberOption(
                opt => opt
                .setName('amount')
                .setDescription('Amount of XP to remove.')
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName('clear')
            .setDescription('Remove all the XP of a member.')
            .addUserOption(
                opt => opt
                .setName('user')
                .setDescription('User who will lost all of his XP.')
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName('drop')
            .setDescription('Drop some XP points!')
            .addNumberOption(
                opt => opt
                .setName('amount')
                .setDescription('Amount of XP points to drop.')
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(this.permission)
    }
};