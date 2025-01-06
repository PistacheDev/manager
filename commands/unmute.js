const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "unmute",
    type: "moderation",
    permission: PermissionsBitField.Flags.ModerateMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.
            const guild = interaction.guild;
            const mod = interaction.member;

            if (!target.isCommunicationDisabled()) return interaction.reply({ content: ":warning: This member isn't muted!", flags: MessageFlags.Ephemeral });
            if (!target.moderatable) return interaction.reply({ content: ":warning: Impossible to unmute this member!", flags: MessageFlags.Ephemeral });

            target.timeout(null).then(() =>
            {
                const embed = new EmbedBuilder()
                .setColor("Green")
                .setThumbnail(target.user.avatarURL())
                .setDescription(`:man_judge: <@${target.id}> has been unmuted!`)
                .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Date de votre désexclusion**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .setTimestamp()
                .setFooter({ text: target.user.username, iconURL: target.user.avatarURL() })

                interaction.channel.send({ embeds: [embed] });
                interaction.deferUpdate();

                const notif = new EmbedBuilder()
                .setColor("Green")
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You have been unmuted in **${guild.name}**!`)
                .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Date de votre désexclusion**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                target.user.createDM({ force: true }).send({ embeds: [notif] });
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Unmute a member.")
        .addUserOption(
            opt => opt
            .setName("user")
            .setDescription("Member to unmute.")
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};