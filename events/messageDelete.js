const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports =
{
    name: "messageDelete",
    async run(client, db, message)
    {
        if (!message.guild) return;
        const guild = message.guild;

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
        {
            if (err) throw err;
            if (data.length < 1 || data[0].messagesLogs == 0 || message.author == null || message.author.bot) return;

            if (!guild.channels.cache.get(data[0].messagesLogs))
            {
                db.query("UPDATE config SET messagesLogs = ? WHERE guild = ?", [0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    return;
                });
            };

            const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 10 });
            const log = auditLogs.entries.find(entry => entry.targetId == message.id);
            if (!log) return;

            const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Message deleted!")
            .setThumbnail(message.member.displayAvatarURL())
            .setImage(message.author.bannerURL())
            .addFields([{ name: ":speech_balloon:・Message Information:", value: `>>> **Author**: <@${message.author.id}> @${message.author.username}.\n**Channel**: <#${message.channel.id}> \`${message.channel.name}\`.\n**Sent Date**: <t:${Math.floor(message.createdAt / 1000)}:F>.\n**Deletion Date**: <t:${Math.floor(Date.now() - 100 / 1000)}:F>.` }])
            .addFields([{ name: ":man_judge:・Moderator:", value: `>>> <@${log.executorId}> @${guild.members.cache.get(log.executorId).user.username}` }])
            .addFields([{ name: ":scroll:・Message Content:", value: `\`\`\`${message.content == "" ? "None" : message.content}\`\`\`` }])
            .addFields([{ name: ":paperclips:・IDs:", value: `>>> **Message**: ${message.id}.\n**Message Author**: ${message.author.id}.\n**Moderator**: ${log.executorId}.\n**Channel**: ${message.channel.id}.\n**Server**: ${guild.id}.` }])
            .setTimestamp()
            .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() })

            await guild.channels.cache.get(data[0].messagesLogs).send({ embeds: [embed] });
        });
    }
};