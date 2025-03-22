const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const channelTypes = require("../json/channels.json");

module.exports =
{
    name: "channelUpdate",
    async run(client, db, oldChannel, newChannel)
    {
        if (!oldChannel.guild) return;
        const guild = oldChannel.guild;

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

            const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate, limit: 10 });
            const log = auditLogs.entries.find(entry => entry.targetId == oldChannel.id);
            if (!log) return;

            let modifications = "";
            if (oldChannel.name != newChannel.name) modifications = `${modifications}**Channel Name**: ${oldChannel.name} ➜ ${newChannel.name}.\n`;
            if (oldChannel.type != newChannel.type) modifications = `${modifications}**Channel Type**: ${channelTypes[oldChannel.type]} ➜ ${channelTypes[newChannel.type]}\n`;
            if (oldChannel.parent != newChannel.parent) modifications = `${modifications}**Category**: ${oldChannel.parent ? oldChannel.parent.name : "None"} ➜ ${newChannel.parent ? newChannel.parent.name : "None"}.\n`;
            if (oldChannel.rateLimitPerUser != newChannel.rateLimitPerUser) modifications = `${modifications}**Slow Mode**: ${oldChannel.rateLimitPerUser ? `${oldChannel.rateLimitPerUser} second(s)` : "Disabled"} ➜ ${newChannel.rateLimitPerUser ? `${newChannel.rateLimitPerUser} second(s)` : "Disabled"}.\n`;
            if (oldChannel.nsfw != newChannel.nsfw) modifications = `${modifications}**${newChannel.nsfw ? "NSFW Mode Enabled" : "NSFW Mode Disabled"}**.\n`;
            if (modifications == "") modifications = "**Modifications detection failed!**";

            const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Channel Modified!")
            .setThumbnail(guild.iconURL())
            .addFields([{ name: ":pencil2:・Modification(s):", value: `>>> ${modifications}` }])
            .addFields([{ name: ":man_judge:・Moderator:", value: `>>> <@${log.executorId}> @${guild.members.cache.get(log.executorId).user.username}` }])
            .addFields([{ name: ":paperclips:・IDs:", value: `>>> **Channel**: ${oldChannel.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${guild.id}.` }])
            .setTimestamp()
            .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() });

            await guild.channels.cache.get(data[0].channelsLogs).send({ embeds: [embed] });
        });
    }
};