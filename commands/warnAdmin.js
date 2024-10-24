const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'warnadmin',
    type: 'moderation',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        // Check what subcommand has been executed.
        switch (interaction.options.getSubcommand())
        {
            case 'list':
                warnsList();
                break;

            case 'remove':
                warnRemove();
                break;

            case 'clear':
                warnsClear();
                break;

            default:
                interaction.reply(':warning: Unknown **command**!');
                break;
        };

        // List every warns of a member.
        function warnsList()
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.

            db.query('SELECT * FROM warns WHERE guild = ? AND target = ?', [interaction.guild.id, target.user.id], async (err, data) =>
            {
                if (data.length < 1) return interaction.reply(':warning: This member **has never been warned** in this server!');
                await data.sort((date1, date2) => parseInt(date2.date) - parseInt(date1.date)); // Sort by recent date.

                let embed = new EmbedBuilder()
                .setColor('Yellow')
                .setAuthor({ name: `@${target.user.username}'s warns:`, iconURL: target.user.avatarURL() })
                .setThumbnail(target.user.avatarURL())
                .setDescription(`Warns count: **${data.length.toString()} warns**.`)
                .setTimestamp()

                // Add the fields to the embed.
                for (let warnsCount = 0; warnsCount < data.length; warnsCount++) embed.addFields([{ name: `${warnsCount + 1}) Warn \`${data[warnsCount].warnID}\`:`, value: `**Moderator**: <@${await data[warnsCount].moderator}>.\n**Sanction Date**: <t:${Math.floor(parseInt(data[warnsCount].date / 1000))}>.\n**Reason**: \`${data[warnsCount].reason}\`.` }]); 
                await interaction.reply({ embeds: [embed] });
            });
        };

        // Remove a warn.
        function warnRemove()
        {
            const warnID = interaction.options.getString('id');

            db.query('SELECT * FROM warns WHERE guild = ? AND warnID = ?', [interaction.guild.id, warnID], async (err, data) =>
            {
                if (data.length < 1) return interaction.reply(':warning: This warn **doesn\'t exist**!');

                // Delete the warn.
                db.query('DELETE FROM warns WHERE guild = ? AND warnID = ?', [interaction.guild.id, warnID], async (err, data) =>
                {
                    interaction.reply(`:white_check_mark: \`${warnID}\` has been **removed successfully**!`);
                });
            });
        };

        // Clear every warns of a member.
        function warnsClear()
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.

            db.query('DELETE FROM warns WHERE guild = ? AND target = ?', [interaction.guild.id, target.user.id], async (err, data) =>
            {
                const deletedCount = data.affectedRows; // Calculate the number of removed warns.

                if (deletedCount < 1) return interaction.reply(':warning: This member **has never been warned** in this server!');
                interaction.reply(`:white_check_mark: **${deletedCount} warns** of <@${target.id}> @${target.user.username} have been **removed successfully**!`);
            });
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Warns management dedicated commands.')
        .addSubcommand(
            cmd => cmd
            .setName('list')
            .setDescription('List member\'s warns.')
            .addUserOption(
                opt => opt
                .setName('user')
                .setDescription('Targeted member.')
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName('remove')
            .setDescription('Remove a warn.')
            .addStringOption(
                opt => opt
                .setName('id')
                .setDescription('Warn ID.')
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName('clear')
            .setDescription('Remove every member\'s warns.')
            .addUserOption(
                opt => opt
                .setName('user')
                .setDescription('Targeted member.')
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(this.permission)
    }
};