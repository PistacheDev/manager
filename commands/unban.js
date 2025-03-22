const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "unban",
    type: "moderation",
    permission: PermissionsBitField.Flags.BanMembers,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        const mod = interaction.member;

        guild.bans.fetch().then(async bans =>
        {
            const ID = interaction.options.getString("id");
            const bannedUser = bans.find(banned => banned.user.id == ID);

            if (!client.users.cache.get(ID)) return interaction.reply({ content: ":warning: This user doesn't exist!", flags: MessageFlags.Ephemeral });
            if (!bannedUser) return interaction.reply({ content: ":warning: This user isn't banned from this server!", flags: MessageFlags.Ephemeral });

            await guild.members.unban(bannedUser.user).then(() =>
            {
                console.log(`[${this.name}] ${guild.id}, ${mod.id}, ${ID}, ${Date.now()}`);

                const embed = new EmbedBuilder()
                .setColor("Green")
                .setThumbnail(bannedUser.user.avatarURL())
                .setDescription(`:man_judge: @${bannedUser.user.username} (${ID}) has been unbanned!`)
                .addFields([{ name: ":man_judge:・Moderator :", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Unban's Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .setTimestamp()
                .setFooter({ text: bannedUser.user.username, iconURL: bannedUser.user.avatarURL() })

                interaction.channel.send({ embeds: [embed] });
                interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });

                const notif = new EmbedBuilder()
                .setColor("Green")
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You have been unbanned from **${guild.name}**!`)
                .addFields([{ name: ":man_judge:・Moderator :", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Unban's Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                client.users.cache.get(ID).createDM({ force: true }).send({ embeds: [notif] });
            });
        });
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Unban a user.")
        .addStringOption(opt => opt
            .setName("id")
            .setDescription("User ID.")
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};