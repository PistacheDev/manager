const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const channelTypes = require('../channelTypes.json');

module.exports =
{
    name: 'channelDelete',
    async run(client, db, channel)
    {
        try
        {
            if (!channel.guild) return; // If the channel isn't in a guild (like a DM).
            const guild = channel.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1 || data[0].channelsLogs == 0) return; // Some database verifications.

                const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 10 }); // Fetch server logs.
                const results = auditLogs.entries;
                const log = results.find(entry => entry.targetId == channel.id); // Fetch for the latest log with the channel ID.
                if (!log) return;

                const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Channel Deleted!')
                .setThumbnail(guild.iconURL())
                .addFields([{ name: ':speech_balloon:・Channel Information:', value: `>>> **Name**: ${channel.name}.\n**Type**: ${channelTypes[channel.type.toString()]}.\n**Public**: ${channel.permissionOverwrites.cache.get(guild.roles.everyone.id)?.deny.toArray(false).includes('ViewChannel') ? 'No' : 'Yes'}.\n**Creation Date**: <t:${Math.floor(channel.createdAt / 1000)}:F>.\n**Deletion Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> <@${log.executorId}> @${guild.members.cache.get(log.executorId).user.username}` }])
                .addFields([{ name: ':paperclips:・IDs:', value: `>>> **Channel**: ${channel.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${guild.id}.` }])
                .setTimestamp()
                .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() });

                await guild.channels.cache.get(data[0].channelsLogs).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            console.error(`[error] channelDelete, ${channel.id}, ${err}, ${Date.now()}`);
        };
    }
};