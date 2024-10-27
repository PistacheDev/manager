const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: 'ban',
    type: 'moderation',
    permission: Perms.BanMembers,
    async run(client, db, interaction)
    {
        try
        {
            // Command options.
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.
            const reason = interaction.options.getString('reason');
            const deleteTime = interaction.options.getNumber('messages');

            // Shortcuts.
            const guild = interaction.guild;
            const mod = interaction.member;
            const targetID = target.id;
            const ownerID = guild.ownerId;

            // Some verifications.
            if (targetID == mod.id) return interaction.reply(':warning: You can\'t ban **yourself**!' );
            if (ownerID == targetID) return interaction.reply(':warning: You can\'t ban the **server owner**!');
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(':warning: You **can\'t ban** this member!' );
            if (targetID == client.user.id) return interaction.reply(':warning: You can\'t **ban the application** with this command!' );
            if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply(`:warning: **Only the owner** can ban an administrator!`);
            if (!target.bannable) return interaction.reply(':warning: **Impossible** to ban this member!' );
            if (deleteTime && (deleteTime < 1 || deleteTime > 7)) return interaction.reply(':warning: You can\'t delete messages **older than 7 days** and **the minimum allowed is 1 day**.');

            target.ban({ reason: `[${mod.id}] ${reason}`, deleteMessageDays: deleteTime ? deleteTime : 0 }).then(() =>
            {
                interaction.channel.send(`:man_judge: ${target.user.username} (${targetID}) has been banned by <@${mod.id}>!\n**Reason**: **\`${reason}\`**`);
                interaction.deferUpdate(); // To avoid an error.

                const embed = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You've been banned from **${guild.name}**!`)
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Ban Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ':grey_question:・Reason:', value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

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
        ).addNumberOption(
            opt => opt
            .setName('messages')
            .setDescription('Delete the messages sent in a period of time in days.')
        ).setDefaultMemberPermissions(this.permission)
    }
};