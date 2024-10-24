const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'mute',
    type: 'moderation',
    permission: PermissionsBitField.Flags.ModerateMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.
            const time = interaction.options.getNumber('time');
            const scale = interaction.options.getString('scale');
            const reason = interaction.options.getString('reason');

            // Some verifications.
            if (target.id == interaction.user.id) return interaction.reply(':warning: You can\'t mute **yourself**!');
            if (await interaction.guild.fetchOwner() == target.id) return interaction.reply(':warning: You can\'t mute the **server owner**!');
            if (interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(':warning: You **can\'t mute** this member!');
            if (target.user.id == client.user.id) return interaction.reply(':warning: You **can\'t mute the application** with this command!');
            if (target.isCommunicationDisabled()) return interaction.reply(':warning: This member is **already muted**.');
            if (interaction.user.id != interaction.guild.ownerId && target.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(`:warning: **Only the owner** can ban an administrator!`);
            if (!target.moderatable) return interaction.reply(':warning: **Impossible** to mute this member!');

            let timeMs;
            if (scale == 'm' || scale == 'h' || scale == 'd')
            {
                // Convert the time in ms.
                if (scale == 'm') timeMs = time * 60000;
                if (scale == 'h') timeMs = time * 3600000;
                if (scale == 'd') timeMs = time * 86400000;
            } else return interaction.reply(':warning: The **scale** that you provided is **incorrect**!\nEnter `m` for **minutes**, `h` for **hours** or `d` for **days**.')

            if (timeMs < 60000 || timeMs > 604800000) return interaction.reply(':warning: You can\'t mute a member **less than 1 minute** and **more than 7 days**!');
            target.timeout(timeMs).then(() => {
                interaction.channel.send(`:man_judge: ${interaction.user.username} (${interaction.user.id}) has been muted by <@${interaction.user.id}> for ${time} ${scale == 'm' ? 'minutes' : scale == 'h' ? 'hours' : 'days'}!\n**Reason**: **\`${reason}\`**`);
                interaction.deferUpdate(); // To avoid an error.

                const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(`:scales: You've been muted in **${interaction.guild.name}**!`)
                .addFields([{ name: ':man_judge:・Moderator :', value: `>>> **User**: <@${interaction.user.id}> @${interaction.user.username}.\n**ID**: ${interaction.user.id}.\n**Mute Duration**: ${time} ${scale == 'm' ? 'minutes' : scale == 'h' ? 'hours' : 'days'}.\n**Sanction Date** : <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ':grey_question:・Reason :', value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                // Send a DM to alert the user for the mute.
                target.user.createDM({ force: true }).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] mute, ${err}, ${Date.now()}`);
        };
    },
    get data() {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Mute a member.')
        .addUserOption(
            opt => opt
            .setName('user')
            .setDescription('User to mute.')
            .setRequired(true)
        ).addNumberOption(
            opt => opt
            .setName('time')
            .setDescription('Mute duration in hours.')
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName('scale')
            .setDescription('Scale of time (m (minutes), h (hours) or d (days)).')
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName('reason')
            .setDescription('Sanction reason.')
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};