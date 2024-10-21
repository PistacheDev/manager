const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'kick',
    type: 'moderation',
    permission: PermissionsBitField.Flags.KickMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.
            const reason = interaction.options.getString('reason');

            // Some verifications.
            if (target.id == interaction.user.id) return interaction.reply(':warning: You can\'t kick **yourself**!');
            if (interaction.guild.ownerId == target.id) return interaction.reply(':warning: You can\'t kick the **server owner**.');
            if (interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(':warning: You **can\'t kick** this member!');
            if (target.id == client.user.id) return interaction.reply(':warning: You can\'t **kick the application** with this command!');
            if (interaction.user.id != interaction.guild.ownerId && target.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(`:warning: **Only the owner** can kick an administrator!`);
            if (!target.kickable) return interaction.reply(':warning: **Impossible** to kick this member!');

            target.kick({ reason: reason }).then(() =>
            {
                interaction.channel.send(`:man_judge: ${interaction.user.username} (${interaction.user.id}) has been kicked by <@${interaction.user.id}>!\n**Reason**: **\`${reason}\`**`);
                interaction.deferUpdate(); // To avoid an error.

                const embed = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(`:scales: You've been kicked from **${interaction.guild.name}**!`)
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> **User**: <@${interaction.user.id}> @${interaction.user.username}.\n**ID**: ${interaction.user.id}.\n**Kick Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ':grey_question:・Reason:', value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                // Send a DM to alert the user for the kick.
                target.user.createDM({ force: true }).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] kick, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Kick a member.')
        .addUserOption(
            opt => opt
            .setName('user')
            .setDescription('User to kick.')
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName('reason')
            .setDescription('Sanction reason.')
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};