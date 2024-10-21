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
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.

            // Some verifications.
            if (!target.isCommunicationDisabled()) return interaction.reply(':warning: This member **isn\'t muted**!');
            if (!target.moderatable) return interaction.reply(':warning: **Impossible** to unmute this member!');

            target.timeout(null).then(() =>
            {
                interaction.channel.send(`:man_judge: ${interaction.user.username} (${interaction.user.id}) has been unmuted by <@${interaction.user.id}>!`);
                interaction.deferUpdate(); // To avoid an error.

                const embed = new EmbedBuilder()
                .setColor('Green')
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(`:scales: You've been unmuted in **${interaction.guild.name}**!`)
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> **User**: <@${interaction.user.id}> @${interaction.user.username}.\n**ID**: ${interaction.user.id}.\n**Date de votre désexclusion**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                // Send a DM to alert the user for the unmute.
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