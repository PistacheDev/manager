const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'unban',
    type: 'moderation',
    permission: PermissionsBitField.Flags.BanMembers,
    async run(client, db, interaction)
    {
        try
        {
            interaction.guild.bans.fetch().then(async bans =>
            {
                const targetID = interaction.options.getString('id');
                const bannedUser = bans.find(banned => banned.user.id == targetID); // Fetch the user in the server's ban list.

                // Some verifications.
                if (!client.users.cache.get(targetID)) return interaction.reply(':warning: This user **doesn\'t exist**!');
                if (!bannedUser) return interaction.reply(':warning: This user **isn\'t banned** from this server!');

                await interaction.guild.members.unban(bannedUser.user).then(() =>
                {
                    interaction.reply(`:white_check_mark: <@${targetID}> has been **unbanned successfully**!`);

                    const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setThumbnail(interaction.guild.iconURL())
                    .setDescription(`:scales: You've been unbanned from **${interaction.guild.name}**!`)
                    .addFields([{ name: ':man_judge:・Moderator :', value: `>>> **User**: <@${interaction.user.id}> @${interaction.user.username}.\n**ID**: ${interaction.user.id}.\n**Unban Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                    .setTimestamp()
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                    // Send a DM to alert the user for the unban.
                    client.users.cache.get(targetID).createDM({ force: true }).send({ embeds: [embed] });
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] unban, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Unban a user.')
        .addStringOption(
            opt => opt
            .setName('id')
            .setDescription('User ID.')
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};