const { calculXP } = require('../functions/xpRanking');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'experience',
    type: 'gaming',
    async run(client, db, interaction)
    {
        try
        {
            var target = interaction.options.getUser('user');
            if (!target) target = interaction.member; // Select the current user if nothing is specified.
            target = interaction.guild.members.cache.get(target.id); // Get the user on the server list.

            // Check what subcommand has been executed.
            switch (interaction.options.getSubcommand())
            {
                case 'rank':
                    displayRank();
                    break;

                case 'leaderboard':
                    displayLeaderboard();
                    break;

                default:
                    interaction.reply(':warning: Unknown **command**!');
                    break;
            };

            // Render and display the user's rank card.
            function displayRank()
            {
                db.query('SELECT * FROM xp WHERE guild = ? AND user = ?', [interaction.guild.id, target.user.id], async (err, data) =>
                {
                    // Some verifications.
                    if (data.length < 1) return interaction.reply(':warning: This user **doesn\'t have any XP**!');
                    if (target.user.bot) return interaction.reply(':warning: The application doesn\'t **give XP** to **bots**!');

                    db.query('SELECT * FROM xp WHERE guild = ?', [interaction.guild.id], async (err, all) =>
                    {
                        // Calculate the user's position in the server leaderboard.
                        all = await all.sort(async (a, b) => (await calculXP(parseInt(b.xp), parseInt(b.level)) - (await calculXP(parseInt(a.xp), parseInt(a.level)))));
                        const currentLevel = parseInt(data[0].level);

                        const embed = new EmbedBuilder()
                        .setColor('Gold')
                        .setTitle(`@${target.user.username}'s experience:`)
                        .setThumbnail(target.user.avatarURL())
                        .setDescription(`>>> **XP**: ${parseInt(data[0].xp)}/${500 + (currentLevel * 10)}.\n**Level**: ${currentLevel}.\n**Rank**: ${all.findIndex(users => users.user == target.id) + 1}/${interaction.guild.memberCount}.`)

                        await interaction.reply({ embeds: [embed] });
                    });
                });
            };

            // Render and display the leaderboard.
            function displayLeaderboard()
            {
                db.query('SELECT * FROM xp WHERE guild = ?', [interaction.guild.id], async (err, data) =>
                {
                    if (data.length < 1) return interaction.reply(':warning: No members have XP on this server!');
                    // Calculate the leaderboard.
                    let leaderboard = await data.sort(async (a, b) => (await calculXP(parseInt(b.xp), parseInt(b.level)) - (await calculXP(parseInt(a.xp), parseInt(a.level)))));

                    let embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setTitle(`Server Leaderboard:`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                    for (let i = 0; i < (data.length > 10 ? 10 : data.length); i++)
                    {
                        // Search the (next) highest user.
                        let rank = leaderboard.findIndex(users => users.user == leaderboard[i].user) + 1;
                        const emojis = ['first', 'second', 'third']; // To handle the three medals emoji.

                        // Generate the field.
                        embed.addFields([{ name: `${rank < 4 ? `:${emojis[rank - 1]}_place:` : ':medal:'} Top #${rank}`, value: `>>> **User**: <@${leaderboard[i].user}>.\n**Level**: ${leaderboard[i].level}.\n**XP**: ${leaderboard[i].xp}/${500 + (leaderboard[i].level * 10)}.` }])
                    };

                    await interaction.reply({ embeds: [embed] });
                });
            };
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] experience ${interaction.options.getSubcommand()}, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Experience dedicated commands.')
        .addSubcommand(
            cmd => cmd
            .setName('rank')
            .setDescription('Show the rank of a member.')
            .addUserOption(
                opt => opt
                .setName('user')
                .setDescription('Targeted member.')
            )
        ).addSubcommand(
            cmd => cmd
            .setName('leaderboard')
            .setDescription('Show the server leaderboard.')
        )
    }
};