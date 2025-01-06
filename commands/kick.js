const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: "kick",
    type: "moderation",
    permission: Perms.KickMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.
            const reason = interaction.options.getString("reason");

            const guild = interaction.guild;
            const mod = interaction.member;
            const targetID = target.id;
            const ownerID = guild.ownerId;

            if (targetID == mod.id) return interaction.reply({ content: ":warning: You can't kick yourself!", flags: MessageFlags.Ephemeral });
            if (ownerID == targetID) return interaction.reply({ content: ":warning: You can't kick the server owner.", flags: MessageFlags.Ephemeral });
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: You can't kick this member!", flags: MessageFlags.Ephemeral });
            if (targetID == client.user.id) return interaction.reply({ content: ":warning: You can't kick the application with this command!", flags: MessageFlags.Ephemeral });
            if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply({ content: ":warning: Only the owner can kick an administrator!", flags: MessageFlags.Ephemeral });
            if (!target.kickable) return interaction.reply({ content: ":warning: Impossible to kick this member!", flags: MessageFlags.Ephemeral });

            target.kick({ reason: `[${mod.id}] ${reason}` }).then(() =>
            {
                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setThumbnail(target.user.avatarURL())
                .setDescription(`:man_judge: <@${targetID}> has been kicked!`)
                .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Ban Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ":grey_question:・Reason:", value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: target.user.username, iconURL: target.user.avatarURL() })

                interaction.message.channel({ embeds: [embed] });
                interaction.deferUpdate();

                const notif = new EmbedBuilder()
                .setColor("Orange")
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You have been kicked from **${guild.name}**!`)
                .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Kick Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ":grey_question:・Reason:", value: `\`\`\`${reason}\`\`\`` }])
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
        .setDescription("Kick a member.")
        .addUserOption(
            opt => opt
            .setName("user")
            .setDescription("User to kick.")
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName("reason")
            .setDescription("Sanction reason.")
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};