const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const channelTypes = require("../json/channels.json");

module.exports =
{
    name: "channelCreate",
    async run(client, db, channel)
    {
        try
        {
            if (!channel.guild) return;
            const guild = channel.guild;

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1 || data[0].channelsLogs == 0) return;

                const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 10 }); // Fetch server logs.
                const log = auditLogs.entries.find(entry => entry.targetId == channel.id); // Fetch for the latest log with the channel ID.
                if (!log) return;

                const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("Channel Created!")
                .setThumbnail(guild.iconURL())
                .addFields([{ name: ":speech_balloon:・Channel Information:", value: `>>> **Name**: <#${channel.id}> \`${channel.name}\`.\n**Type**: ${channelTypes[channel.type.toString()]}.\n**Public**: ${channel.permissionOverwrites.cache.get(guild.roles.everyone.id)?.deny.toArray(false).includes("ViewChannel") ? "No" : "Yes"}.\n**URL**: ${channel.url}.\n**Creation Date**: <t:${Math.floor(channel.createdAt / 1000)}:F>.` }])
                .addFields([{ name: ":man_judge:・Moderator:", value: `>>> <@${log.executorId}> @${guild.members.cache.get(log.executorId).user.username}` }])
                .addFields([{ name: ":paperclips:・IDs:", value: `>>> **Channel**: ${channel.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${guild.id}.` }])
                .setTimestamp()
                .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() });

                await guild.channels.cache.get(data[0].channelsLogs).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};