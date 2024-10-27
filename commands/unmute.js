const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'unmute',
    type: 'moderation',
    permission: PermissionsBitField.Flags.ModerateMembers,
    async run(client, db, interaction)
    {
        try
        {
            // Command option.
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.

            // Some shortcuts.
            const guild = interaction.guild;
            const mod = interaction.member;

            // Some verifications.
            if (!target.isCommunicationDisabled()) return interaction.reply(':warning: This member **isn\'t muted**!');
            if (!target.moderatable) return interaction.reply(':warning: **Impossible** to unmute this member!');

            target.timeout(null).then(() =>
            {
                interaction.channel.send(`:man_judge: <@${target.id}> has been unmuted by <@${mod.id}>!`);
                interaction.deferUpdate();

                const embed = new EmbedBuilder()
                .setColor('Green')
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You've been unmuted in **${guild.name}**!`)
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Date de votre désexclusion**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                target.user.createDM({ force: true }).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] unmute, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Unmute a member.')
        .addUserOption(
            opt => opt
            .setName('user')
            .setDescription('Member to unmute.')
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};