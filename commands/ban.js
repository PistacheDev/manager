const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: "ban",
    type: "moderation",
    permission: Perms.BanMembers,
    async run(client, db, interaction)
    {
        const target = interaction.guild.members.cache.get(interaction.options.getUser("user").id);
        const reason = interaction.options.getString("reason");
        const definitive = interaction.options.getBoolean("definitive");
        const deleteTime = interaction.options.getNumber("messages");

        const guild = interaction.guild;
        const mod = interaction.member;
        const targetID = target.id;
        const ownerID = guild.ownerId;
        const me = guild.members.cache.get(client.user.id);

        if (targetID == mod.id) return interaction.reply({ content: ":warning: You can't ban yourself!", flags: MessageFlags.Ephemeral });
        if (ownerID == targetID) return interaction.reply({ content: ":warning: You can't ban the server owner!", flags: MessageFlags.Ephemeral });
        if (targetID == client.user.id) return interaction.reply({ content: ":warning: You can't ban the application with its own command!", flags: MessageFlags.Ephemeral });
        if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: You can't ban this member!", flags: MessageFlags.Ephemeral });
        if (me.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: I can't ban this member!", flags: MessageFlags.Ephemeral });
        if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply({ content: ":warning: Only the owner can ban an administrator!", flags: MessageFlags.Ephemeral });
        if (!target.bannable) return interaction.reply({ content: ":warning: Impossible to ban this member!", flags: MessageFlags.Ephemeral });
        if (deleteTime && deleteTime > 604800) return interaction.reply({ content: ":warning: You can't delete messages older than 7 days (604800 seconds).", flags: MessageFlags.Ephemeral });
        if (deleteTime && deleteTime < 1) return interaction.reply({ content: ":warning: You can't pick up a value under 1 second for the messages deletion.", flags: MessageFlags.Ephemeral });

        target.ban({ reason: `[${mod.id}] ${reason}`, deleteMessageSeconds: deleteTime ? deleteTime : null }).then(() =>
        {
            console.loh(`[${this.name}] ${guild.id}, ${mod.id}, ${targetID}, ${definitive}, ${deleteTime}, "${reason}"`);

            const embed = new EmbedBuilder()
            .setColor("Red")
            .setThumbnail(target.user.avatarURL())
            .setDescription(`:man_judge: <@${targetID}> @${target.user.username} has been banned${definitive ? " definitively" : ""}!`)
            .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Sanction's Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
            .addFields([{ name: ":grey_question:・Reason:", value: `\`\`\`${reason}\`\`\`` }])
            .setTimestamp()
            .setFooter({ text: target.user.username, iconURL: target.user.avatarURL() })

            interaction.channel.send({ embeds: [embed] });
            interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });

            const notif = new EmbedBuilder()
            .setColor("Red")
            .setThumbnail(guild.iconURL())
            .setDescription(`:scales: You have been banned${definitive ? " definitively" : ""} from **${guild.name}**!`)
            .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Sanction's Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
            .addFields([{ name: ":grey_question:・Reason:", value: `\`\`\`${reason}\`\`\`` }])
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            target.user.createDM({ force: true }).send({ embeds: [notif] });

            if (definitive)
            {
                db.query("INSERT INTO bans (`guild`, `user`, `moderator`, `reason`, `date`) VALUES (?, ?, ?, ?, ?)", [guild.id, target.id, mod.id, reason.replace(/"/g, "\\'"), Date.now()], async (err) =>
                {
                    if (err) throw err;
                });
            };
        });
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Ban a member from your server.")
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("Member to ban.")
            .setRequired(true)
        ).addStringOption(opt => opt
            .setName("reason")
            .setDescription("Sanction reason.")
            .setRequired(true)
        ).addBooleanOption(opt => opt
            .setName("definitive")
            .setDescription("Auto-ban the user each time he tries to join the server even unbanned. ONLY revocable by the owner.")
            .setRequired(true)
        ).addNumberOption(opt => opt
            .setName("messages")
            .setDescription("Delete the messages sent in a period of time in seconds.")
        ).setDefaultMemberPermissions(this.permission)
    }
};