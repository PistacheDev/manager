const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports =
{
    name: "guildBanAdd",
    async run(client, db, ban)
    {
        const guild = ban.guild;

        db.query("SELECT * FROM config WHERE guild = ?", [ban.guild.id], async (err, data) =>
        {
            if (err) throw err;
            if (data.length < 1 || data[0].bansLogs == 0) return;

            if (!guild.channels.cache.get(data[0].bansLogs))
            {
                db.query("UPDATE config SET bansLogs = ? WHERE guild = ?", [0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    return;
                });
            };

            const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 10 });
            const log = auditLogs.entries.find(entry => entry.targetId == ban.user.id);
            if (!log) return;

            const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("New Ban!")
            .setThumbnail(ban.user.displayAvatarURL())
            .setImage(ban.user.bannerURL())
            .addFields([{ name: ":airplane_departure:・Banned User:", value: `>>> **Identity**: <@${ban.user.id}> @${ban.user.username}.\n**Account Creation**: <t:${Math.floor(ban.user.createdAt / 1000)}:F>.\n**Bot**: ${ban.user.bot ? "Yes" : "No"}.` }])
            .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **Identity**: <@${log.executorId}> @${guild.members.cache.get(log.executorId).user.username}.\n**Bot**: ${guild.members.cache.get(log.executorId).user.bot ? "Yes" : "No"}.` }])
            .addFields([{ name: ":scales:・Reason:", value: `\`\`\`${log.reason == null ? "None" : log.reason}\`\`\`` }])
            .addFields([{ name: ":paperclips:・IDs:", value: `>>> **Banned**: ${ban.user.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${guild.id}.` }])
            .setTimestamp()
            .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() })

            await guild.channels.cache.get(data[0].bansLogs).send({ embeds: [embed] });
        });
    }
};