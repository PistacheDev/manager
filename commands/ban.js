const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Perms = PermissionsBitField.Flags; // Shortcut.

module.exports =
{
    name: 'ban',
    type: 'moderation',
    permission: Perms.BanMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.
            const reason = interaction.options.getString('reason');

            // Some verifications.
            if (target.id == interaction.user.id) return interaction.reply(':warning: You can\'t ban **yourself**!' );
            if (interaction.guild.ownerId == target.id) return interaction.reply(':warning: You can\'t ban the **server owner**!');
            if (interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(':warning: You **can\'t ban** this member!' );
            if (target.id == client.user.id) return interaction.reply(':warning: You can\'t **ban the application** with this command!' );
            if (interaction.user.id != interaction.guild.ownerId && target.permissions.has(Perms.Administrator)) return interaction.reply(`:warning: **Only the owner** can ban an administrator!`);
            if (!target.bannable) return interaction.reply(':warning: **Impossible** to ban this member!' );

            target.ban({ reason: reason }).then(() =>
            {
                interaction.channel.send(`:man_judge: ${interaction.user.username} (${interaction.user.id}) has been banned by <@${interaction.user.id}>!\n**Reason**: **\`${reason}\`**`);
                interaction.deferUpdate(); // To avoid an error.

                const embed = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(`:scales: You've been banned from **${interaction.guild.name}**!`)
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> **User**: <@${interaction.user.id}> @${interaction.user.username}.\n**ID**: ${interaction.user.id}.\n**Ban Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ':grey_question:・Reason:', value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                // Send a DM to alert the user for the ban.
                target.user.createDM({ force: true }).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] ban, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Ban a member.')
        .addUserOption(
            opt => opt
            .setName('user')
            .setDescription('Member to ban.')
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName('reason')
            .setDescription('Sanction reason.')
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};