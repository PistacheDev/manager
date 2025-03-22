const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const channelTypes = require("../json/channels.json");

module.exports =
{
    name: "channelDelete",
    async run(client, db, channel)
    {
        if (!channel.guild) return;
        const guild = channel.guild;

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
        {
            if (err) throw err;
            if (data.length < 1 || data[0].channelsLogs == 0) return;

            if (!guild.channels.cache.get(data[0].channelsLogs))
            {
                db.query("UPDATE config SET channelsLogs = ? WHERE guild = ?", [0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    return;
                });
            };

            const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 10 });
            const log = auditLogs.entries.find(entry => entry.targetId == channel.id);
            if (!log) return;

            const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Channel Deleted!")
            .setThumbnail(guild.iconURL())
            .addFields([{ name: ":speech_balloon:・Channel Information:", value: `>>> **Name**: ${channel.name}.\n**Type**: ${channelTypes[channel.type.toString()]}.\n**Public**: ${channel.permissionOverwrites.cache.get(guild.roles.everyone.id)?.deny.toArray(false).includes("ViewChannel") ? "No" : "Yes"}.\n**Creation Date**: <t:${Math.floor(channel.createdAt / 1000)}:F>.\n**Deletion Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
            .addFields([{ name: ":man_judge:・Moderator:", value: `>>> <@${log.executorId}> @${guild.members.cache.get(log.executorId).user.username}` }])
            .addFields([{ name: ":paperclips:・IDs:", value: `>>> **Channel**: ${channel.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${guild.id}.` }])
            .setTimestamp()
            .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() });

            await guild.channels.cache.get(data[0].channelsLogs).send({ embeds: [embed] });
        });
    }
};