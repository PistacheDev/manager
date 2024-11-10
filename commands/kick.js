const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: 'kick',
    type: 'moderation',
    permission: Perms.KickMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.
            const reason = interaction.options.getString('reason');

            const guild = interaction.guild;
            const mod = interaction.member;
            const targetID = target.id;
            const ownerID = guild.ownerId;

            if (targetID == mod.id) return interaction.reply(':warning: You can\'t kick **yourself**!');
            if (ownerID == targetID) return interaction.reply(':warning: You can\'t kick the **server owner**.');
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(':warning: You **can\'t kick** this member!');
            if (targetID == client.user.id) return interaction.reply(':warning: You can\'t **kick the application** with this command!');
            if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply(`:warning: **Only the owner** can kick an administrator!`);
            if (!target.kickable) return interaction.reply(':warning: **Impossible** to kick this member!');

            target.kick({ reason: `[${mod.id}] ${reason}` }).then(() =>
            {
                interaction.channel.send(`:man_judge: ${target.user.username} (${target.id}) has been kicked by <@${mod.id}>!\n**Reason**: **\`${reason}\`**`);
                interaction.deferUpdate();

                const embed = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You've been kicked from **${guild.name}**!`)
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Kick Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ':grey_question:・Reason:', value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

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