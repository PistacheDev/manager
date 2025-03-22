const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports =
{
    name: "warnadmin",
    type: "moderation",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;

        switch (interaction.options.getSubcommand())
        {
            case "list":
                list();
                break;
            case "remove":
                remove();
                break;
            case "clear":
                clear();
                break;
            default:
                interaction.reply({ content: ":warning: Command not found!", flags: MessageFlags.Ephemeral });
                break;
        };

        function list()
        {
            const target = guild.members.cache.get(interaction.options.getUser("user").id);

            db.query("SELECT * FROM warns WHERE guild = ? AND target = ?", [guild.id, target.user.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return interaction.reply({ content: ":warning: This member was never warned in this server!", flags: MessageFlags.Ephemeral });

                await data.sort((a, b) => parseInt(b.date) - parseInt(a.date));
                const loop = data.length > 10 ? 10 : data.length;

                let embed = new EmbedBuilder()
                .setColor("Yellow")
                .setDescription(`@${target.user.username}'s warns count: **${data.length.toString()} warn(s)**.`)

                for (let i = 0; i < loop; i++)
                {
                    embed.addFields([{ name: `${i + 1}) Warn \`${data[i].warnID}\`:`, value: `**Moderator**: <@${await data[i].moderator}>.\n**Sanction Date**: <t:${Math.floor(parseInt(data[i].date / 1000))}>.\n**Reason**: \`${data[i].reason}\`.` }]); 
                };

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("warnslistPrevious")
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("warnslistSearch")
                    .setEmoji("🔍")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(data.length < 11)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("warnslistNext")
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(data.length < 11)
                );

                await interaction.reply({ embeds: [embed], components: [buttons] });
            });
        };

        function remove()
        {
            const warnID = interaction.options.getString("id");

            db.query("SELECT * FROM warns WHERE guild = ? AND warnID = ?", [guild.id, warnID], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return interaction.reply({ content: ":warning: This warn doesn't exist!", flags: MessageFlags.Ephemeral });

                db.query("DELETE FROM warns WHERE guild = ? AND warnID = ?", [guild.id, warnID], async (err, data) =>
                {
                    if (err) throw err;
                    interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });
                });
            });
        };

        function clear()
        {
            const target = guild.members.cache.get(interaction.options.getUser("user").id);

            db.query("DELETE FROM warns WHERE guild = ? AND target = ?", [guild.id, target.user.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.affectedRows < 1) return interaction.reply({ content: ":warning: This member has never been warned in this server!", flags: MessageFlags.Ephemeral });

                await interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });
            });
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Warns management dedicated commands.")
        .addSubcommand(cmd => cmd
            .setName("list")
            .setDescription("List member's warns.")
            .addUserOption(opt => opt
                .setName("user")
                .setDescription("Targeted member.")
                .setRequired(true)
            )
        ).addSubcommand(cmd => cmd
            .setName("remove")
            .setDescription("Remove a warn.")
            .addStringOption(opt => opt
                .setName("id")
                .setDescription("Warn ID.")
                .setRequired(true)
            )
        ).addSubcommand(cmd => cmd
            .setName("clear")
            .setDescription("Remove every member's warns.")
            .addUserOption(opt => opt
                .setName("user")
                .setDescription("Targeted member.")
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(this.permission)
    }
};