const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports =
{
    name: "warnadmin",
    type: "moderation",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;

        switch (interaction.options.getSubcommand()) // Check what sub command has been executed.
        {
            case "list":
                warnsList();
                break;
            case "remove":
                warnRemove();
                break;
            case "clear":
                warnsClear();
                break;
            default:
                interaction.reply(":warning: Unknown **command**!");
                break;
        };

        function warnsList()
        {
            const target = guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.

            db.query("SELECT * FROM warns WHERE guild = ? AND target = ?", [guild.id, target.user.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return interaction.reply(":warning: This member **has never been warned** in this server!");
                await data.sort((a, b) => parseInt(b.date) - parseInt(a.date)); // Sort by recent date.

                let embed = new EmbedBuilder()
                .setColor("Yellow")
                .setAuthor({ name: `@${target.user.username}'s warns:`, iconURL: target.user.avatarURL() })
                .setThumbnail(target.user.avatarURL())
                .setDescription(`Warns count: **${data.length.toString()} warns**.`)
                .setTimestamp()

                // Build the embed.
                for (let i = 0; i < data.length; i++)
                {
                    embed.addFields([{ name: `${i + 1}) Warn \`${data[i].warnID}\`:`, value: `**Moderator**: <@${await data[i].moderator}>.\n**Sanction Date**: <t:${Math.floor(parseInt(data[i].date / 1000))}>.\n**Reason**: \`${data[i].reason}\`.` }]); 
                };

                await interaction.reply({ embeds: [embed] });
            });
        };

        function warnRemove()
        {
            const warnID = interaction.options.getString("id");

            db.query("SELECT * FROM warns WHERE guild = ? AND warnID = ?", [guild.id, warnID], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return interaction.reply(":warning: This warn **doesn't exist**!");

                db.query("DELETE FROM warns WHERE guild = ? AND warnID = ?", [guild.id, warnID], async (err, data) =>
                {
                    if (err) throw err;
                    interaction.reply(`:white_check_mark: \`${warnID}\` has been **removed successfully**!`);
                });
            });
        };

        function warnsClear()
        {
            const target = guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.

            db.query("DELETE FROM warns WHERE guild = ? AND target = ?", [guild.id, target.user.id], async (err, data) =>
            {
                if (err) throw err;
                const deletedCount = data.affectedRows; // Calculate the number of removed warns.

                if (deletedCount < 1) return interaction.reply(":warning: This member **has never been warned** in this server!");
                interaction.reply(`:white_check_mark: **${deletedCount} warns** of <@${target.id}> @${target.user.username} have been **removed successfully**!`);
            });
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Warns management dedicated commands.")
        .addSubcommand(
            cmd => cmd
            .setName("list")
            .setDescription("List member's warns.")
            .addUserOption(
                opt => opt
                .setName("user")
                .setDescription("Targeted member.")
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName("remove")
            .setDescription("Remove a warn.")
            .addStringOption(
                opt => opt
                .setName("id")
                .setDescription("Warn ID.")
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName("clear")
            .setDescription("Remove every member's warns.")
            .addUserOption(
                opt => opt
                .setName("user")
                .setDescription("Targeted member.")
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(this.permission)
    }
};