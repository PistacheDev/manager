const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");
const { calculXP } = require("../functions/xpRanking");

module.exports =
{
    name: "xp",
    type: "gaming",
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        var target = interaction.options.getUser("user");

        if (!target) target = interaction.member;
        target = guild.members.cache.get(target.id);

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;

            if (config.length < 1) data = await fixMissingConfig(guild);
            if (data[0].xp == 0) return interaction.reply({ content: ":warning: The XP system is disabled in this server!", flags: MessageFlags.Ephemeral });

            switch (interaction.options.getSubcommand())
            {
                case "rank":
                    displayRank(config[0]);
                    break;
                case "leaderboard":
                    displayLeaderboard(config[0]);
                    break;
                default:
                    interaction.reply({ content: ":warning: Command not found!", flags: MessageFlags.Ephemeral});
                    break;
            };
        });

        function displayRank(config)
        {
            if (target.user.bot) return interaction.reply({ content: ":warning: The bots don't have any XP!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM xp WHERE guild = ? AND user = ?", [guild.id, target.user.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return interaction.reply({ content: ":warning: This user doesn't have any XP!", flags: MessageFlags.Ephemeral});

                db.query("SELECT * FROM xp WHERE guild = ?", [guild.id], async (err, all) =>
                {
                    if (err) throw err;
                    all = await all.sort((a, b) => (calculXP(parseInt(b.xp), parseInt(b.level)) - calculXP(parseInt(a.xp), parseInt(a.level))));

                    const currentXP = parseInt(data[0].xp);
                    const currentLevel = parseInt(data[0].level);
                    const nextLevel = 500 + (currentLevel * 10);
                    const userRank = all.findIndex(users => users.user == target.id) + 1;
                    const maxLevel = config.xp.split(" ")[2];

                    const embed = new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle(`@${target.user.username}'s experience:`)
                    .setThumbnail(target.user.avatarURL())
                    .setDescription(`>>> **XP**: ${currentXP}${maxLevel > currentLevel ? `/${nextLevel}` : ""}.\n**Level**: ${currentLevel}/${maxLevel}.\n**Rank**: ${userRank}/${(await guild.members.fetch()).filter(member => !member.user.bot).size}.`)

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                });
            });
        };

        function displayLeaderboard(config)
        {
            db.query("SELECT * FROM xp WHERE guild = ?", [guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return interaction.reply({ content: ":warning: No members have XP on this server!", flags: MessageFlags.Ephemeral });

                let leaderboard = data.sort((a, b) => (calculXP(parseInt(b.xp), parseInt(b.level)) - calculXP(parseInt(a.xp), parseInt(a.level))));
                const maxLevel = config.xp.split(" ")[2];

                let embed = new EmbedBuilder()
                .setColor("Gold")
                .setTitle("Server's XP Leaderboard:")
                .setThumbnail(guild.iconURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                for (let i = 0; i < (data.length > 10 ? 10 : data.length); i++)
                {
                    const data = leaderboard[i];
                    const rank = i + 1;
                    const emojis = ["first", "second", "third"];
                    const nextLevel = 500 + (data.level * 10);

                    embed.addFields([{ name: `${rank < 4 ? `:${emojis[rank - 1]}_place:` : ":medal:"} Top #${rank}`, value: `>>> **User**: <@${data.user}>.\n**Level**: ${data.level}/${maxLevel}.\n**XP**: ${data.xp}${maxLevel > data.level ? `/${nextLevel}` : ""}.` }])
                };

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            });
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Experience dedicated commands.")
        .addSubcommand(cmd => cmd
            .setName("rank")
            .setDescription("Show the rank of a member.")
            .addUserOption(opt => opt
                .setName("user")
                .setDescription("Targeted member.")
            )
        ).addSubcommand(cmd => cmd
            .setName("leaderboard")
            .setDescription("Show the server leaderboard.")
        )
    }
};