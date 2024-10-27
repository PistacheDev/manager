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
            const guild = interaction.guild;
            const mod = interaction.member;

            guild.bans.fetch().then(async bans =>
            {
                const targetID = interaction.options.getString('id'); // Command option.
                const bannedUser = bans.find(banned => banned.user.id == targetID);

                // Some verifications.
                if (!client.users.cache.get(targetID)) return interaction.reply(':warning: This user **doesn\'t exist**!');
                if (!bannedUser) return interaction.reply(':warning: This user **isn\'t banned** from this server!');

                await guild.members.unban(bannedUser.user).then(() =>
                {
                    interaction.reply(`:white_check_mark: @${client.users.cache.get(targetID).username} (\`${targetID}\`) has been **unbanned successfully**!`);

                    const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setThumbnail(guild.iconURL())
                    .setDescription(`:scales: You've been unbanned from **${guild.name}**!`)
                    .addFields([{ name: ':man_judge:・Moderator :', value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Unban Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

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