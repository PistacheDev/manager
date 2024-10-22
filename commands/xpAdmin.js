const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'xpadmin',
    type: 'management',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            var target = interaction.options.getUser('user');
            if (!target) target = interaction.member; // Select the current user if nothing is specified.
            target = interaction.guild.members.cache.get(target.id); // Fetch the user in the server list.

            // Check what subcommand has been executed.
            switch (interaction.options.getSubcommand())
            {
                case 'give':
                    giveExperience();
                    break;

                case 'remove':
                    removeExperience();
                    break;

                case 'clear':
                    clearExperience();
                    break;

                default:
                    interaction.reply(':warning: Unknown **command**!');
                    break;
            };

            // Give subcommand script.
            function giveExperience()
            {
                const xpToGive = interaction.options.getNumber('amount');

                db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [interaction.guild.id, target.id], async (err, data) =>
                {
                    // Some verifications.
                    if (xpToGive > 1000 || xpToGive < 1) return interaction.reply(':warning: You can\'t give **more than 1000 XP points** and **less than 1 XP point** per giveaway!');
                    if (data.length < 1)
                    {
                        db.query('INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)', [target.id, interaction.guild.id, 0]);
                        await new Promise(resolve => setTimeout(resolve, 100)); // Wait to let the database insert correctly the data.
                    };

                    db.query('UPDATE xp SET xp = ? WHERE guild = ? AND user = ?', [xpToGive + parseInt(data[0].xp), interaction.guild.id, target.id], async () =>
                    {
                        interaction.reply(`:white_check_mark: **${xpToGive} XP points** were gave to <@${interaction.user.id}> @${interaction.user.username}!`);

                        let currentXP = parseInt(xpToGive + parseInt(data[0].xp)); // New amount of XP.
                        let currentLevel = parseInt(data[0].level);
                        let nextLevel = 500 + (currentLevel * 10); // Calculate the next level goal.

                        // Level-up the user while his XP is greater than the next level goal.
                        while (currentXP >= nextLevel)
                        {
                            currentXP -= nextLevel; // Update the amount of XP.
                            currentLevel += 1;
                            nextLevel = 500 + (currentLevel * 10); // Calculate the new next level goal.

                            // Update user informations in the database.
                            db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [currentXP, currentLevel, interaction.guild.id, interaction.user.id]);
                            interaction.channel.send(`:tada: Congratulation <@${target.id}> @${target.user.username}! You just passed to **level ${currentLevel}**!`);
                        };
                    });
                });
            };

            // Remove subcommand script.
            function removeExperience()
            {
                const xpToRemove = interaction.options.getNumber('amount');

                db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [interaction.guild.id, target.id], async (err, data) =>
                {
                    // Some verifications.
                    if (data.length < 1) return interaction.reply(':warning: This user **doesn\'t have** any XP!');
                    if (xpToRemove > 1000 || xpToRemove < 1) return interaction.reply(':warning: You can\'t remove **more than 1000 XP points** and **less than 1 XP point** per sanction!');

                    db.query('UPDATE xp SET xp = ? WHERE guild = ? AND user = ?', [parseInt(data[0].xp) - xpToRemove, interaction.guild.id, target.id], async () =>
                    {
                        interaction.reply(`:white_check_mark: **${xpToRemove} XP points** were removed from <@${interaction.user.id}> @${interaction.user.username}!`);

                        let currentXP = parseInt(parseInt(data[0].xp) - xpToRemove); // New amount of XP.
                        let currentLevel = parseInt(data[0].level);
                        let previousLevel = 500 + ((currentLevel - 1) * 10); // Calculate the previous level goal.

                        // Level-down the user while his amount of XP is negative.
                        while (currentXP < 0)
                        {
                            currentXP += previousLevel; // New amount of XP.
                            currentLevel -= 1;
                            previousLevel = 500 + ((currentLevel - 1) * 10); // Calculate the new previous level goal.

                            db.query('UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?', [currentXP, currentLevel, interaction.guild.id, target.id]);
                        };
                    });
                });
            };

            // Clear subcommand script.
            function clearExperience()
            {
                db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [interaction.guild.id, target.id], async (err, data) =>
                {
                    if (data.length < 1) return interaction.reply(':warning: This user **doesn\'t have** any XP!');

                    // Remove the user from the database for this server (faster than set everything to 0).
                    db.query('DELETE FROM xp WHERE guild = ? AND user = ?', [interaction.guild.id, target.id], async () =>
                    {
                        interaction.reply(`:white_check_mark: **${data[0].level} levels** and **${data[0].xp} XP points** of <@${target.id}> were deleted successfully!`);
                    });
                });
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
        ).setDefaultMemberPermissions(this.permission)
    }
};