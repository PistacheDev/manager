const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: "mute",
    type: "moderation",
    permission: Perms.ModerateMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.
            const time = interaction.options.getNumber("time");
            const scale = interaction.options.getString("scale");
            const reason = interaction.options.getString("reason");

            const guild = interaction.guild;
            const mod = interaction.member;
            const targetID = target.id;
            const ownerID = guild.ownerId;
            const scaleStr = scale == "m" ? "minutes" : scale == "h" ? "hours" : "days";

            if (targetID == mod.id) return interaction.reply({ content: ":warning: You can't mute yourself!", flags: MessageFlags.Ephemeral });
            if (ownerID == targetID) return interaction.reply({ content: ":warning: You can't mute the server owner!", flags: MessageFlags.Ephemeral });
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: You can't mute this member!", flags: MessageFlags.Ephemeral });
            if (targetID == client.user.id) return interaction.reply({ content: ":warning: You can't mute the application with this command!", flags: MessageFlags.Ephemeral });
            if (target.isCommunicationDisabled()) return interaction.reply({ content: ":warning: This member is already muted.", flags: MessageFlags.Ephemeral });
            if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply({ content: ":warning: Only the owner can mute an administrator!", flags: MessageFlags.Ephemeral});
            if (!target.moderatable) return interaction.reply({ content: ":warning: Impossible to mute this member!", flags: MessageFlags.Ephemeral });

            let timeMs;
            if (scale == "m" || scale == "h" || scale == "d")
            {
                // Convert the time in ms.
                if (scale == "m") timeMs = time * 60000;
                if (scale == "h") timeMs = time * 3600000;
                if (scale == "d") timeMs = time * 86400000;
                if (timeMs < 60000 || timeMs > 604800000) return interaction.reply({ content: ":warning: You can't mute a member less than 1 minute and more than 7 days!", flags: MessageFlags.Ephemeral });
            } else return interaction.reply({ content: ":warning: The scale that you provided is incorrect!\nEnter `m` for minutes, `h` for hours, or `d` for days.", flags: MessageFlags.Ephemeral })

            target.timeout(timeMs).then(() => {
                const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setThumbnail(target.user.avatarURL())
                .setDescription(`:man_judge: <@${targetID}> @${target.user.username} has been muted!`)
                .addFields([{ name: ":man_judge:・Moderator :", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Mute Duration**: ${time} ${scaleStr}.\n**Sanction Date** : <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ":grey_question:・Reason :", value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: target.user.username, iconURL: target.user.avatarURL() })

                interaction.channel.send({ embeds: [embed] });
                interaction.reply({ content: ":white_check_mark: Done!", flags: MessageFlags.Ephemeral });

                const notif = new EmbedBuilder()
                .setColor("Yellow")
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You have been muted in **${guild.name}**!`)
                .addFields([{ name: ":man_judge:・Moderator :", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Mute Duration**: ${time} ${scaleStr}.\n**Sanction Date** : <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ":grey_question:・Reason :", value: `\`\`\`${reason}\`\`\`` }])
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
    get data() {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Mute a member.")
        .addUserOption(
            opt => opt
            .setName("user")
            .setDescription("User to mute.")
            .setRequired(true)
        ).addNumberOption(
            opt => opt
            .setName("time")
            .setDescription("Mute duration in hours.")
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName("scale")
            .setDescription("Scale of time (m (minutes), h (hours) or d (days)).")
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName("reason")
            .setDescription("Sanction reason.")
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};