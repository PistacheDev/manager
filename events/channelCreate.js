const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const channelTypes = require('../channelTypes.json');

module.exports =
{
    name: 'channelCreate',
    async run(client, db, channel)
    {
        try
        {
            if (!channel.guild) return; // If the channel isn't in a guild (like a DM).
            setTimeout(() => {}, 100); // Wait for the new audit log.

            db.query('SELECT * FROM config WHERE guild = ?', [channel.guild.id], async (err, data) =>
            {
                if (data.length < 1 || data[0].channelsLogs == null) return; // Some database verifications.

                // Request the latest guild log for the ChannelDelete event.
                const auditLog = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
                const log = auditLog.entries.first();

                const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Channel Created!')
                .setThumbnail(channel.guild.iconURL())
                .addFields([{ name: ':speech_balloon:・Channel Information:', value: `>>> **Name**: <#${channel.id}> \`${channel.name}\`.\n**Type**: ${channelTypes[channel.type.toString()]}.\n**Public**: ${channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id)?.deny.toArray(false).includes('ViewChannel') ? 'No' : 'Yes'}.\n**URL**: ${channel.url}.\n**Creation Date**: <t:${Math.floor(channel.createdAt / 1000)}:F>.` }])
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> <@${log.executorId}> @${channel.guild.members.cache.get(log.executorId).user.username}` }])
                .addFields([{ name: ':paperclips:・IDs:', value: `>>> **Channel**: ${channel.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${channel.guild.id}.` }])
                .setTimestamp()
                .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() });

                await channel.guild.channels.cache.get(data[0].channelsLogs).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            console.error(`[error] channelCreate, ${err}, ${Date.now()}`);
        };
    }
};