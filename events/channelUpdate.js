const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const channelTypes = require('../channelTypes.json');

module.exports =
{
    name: 'channelUpdate',
    async run(client, db, oldChannel, newChannel)
    {
        try
        {
            if (!oldChannel.guild) return; // If the channel isn't in a guild (like a DM).
            setTimeout(() =>  {}, 100); // Wait for the new audit log.

            db.query('SELECT * FROM config WHERE guild = ?', [oldChannel.guild.id], async (err, data) =>
            {
                if (data.length < 1 || data[0].channelsLogs == null) return; // Some database verifications.

                // Request the latest guild log for the ChannelUpdate event.
                const auditLog = await oldChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate, limit: 1 });
                const log = auditLog.entries.first();

                // Detect every modifications made on the channel and generate a report.
                let modifications = '';
                if (oldChannel.name != newChannel.name) modifications = `${modifications}**Channel Name**: ${oldChannel.name} :arrow_right: ${newChannel.name}.\n`;
                if (oldChannel.type != newChannel.type) modifications = `${modifications}**Channel Type**: ${channelTypes[oldChannel.type]} :arrow_right: ${channelTypes[newChannel.type]}\n`;
                if (oldChannel.parent != newChannel.parent) modifications = `${modifications}**Category**: ${oldChannel.parent ? oldChannel.parent.name : 'None'} :arrow_right: ${newChannel.parent ? newChannel.parent.name : 'None'}.\n`;
                if (oldChannel.rateLimitPerUser != newChannel.rateLimitPerUser) modifications = `${modifications}**Slow Mode**: ${oldChannel.rateLimitPerUser ? `${oldChannel.rateLimitPerUser} second(s)` : 'Disabled'} :arrow_right: ${newChannel.rateLimitPerUser ? `${newChannel.rateLimitPerUser} second(s)` : 'Disabled'}.\n`;
                if (oldChannel.nsfw != newChannel.nsfw) modifications = `${modifications}**${newChannel.nsfw ? 'NSFW Mode Enabled' : 'NSFW Mode Disabled'}**.\n`;

                // Avoid sending an empty report embed.
                // Some modifications can't be detected.
                if (modifications == '') return;

                const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Channel Modified!')
                .setThumbnail(oldChannel.guild.iconURL())
                .addFields([{ name: ':pencil2:・Modification(s):', value: `>>> ${modifications}` }])
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> <@${log.executorId}> @${oldChannel.guild.members.cache.get(log.executorId).user.username}` }])
                .addFields([{ name: ':paperclips:・IDs:', value: `>>> **Channel**: ${oldChannel.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${oldChannel.guild.id}.` }])
                .setTimestamp()
                .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() });

                await oldChannel.guild.channels.cache.get(data[0].channelsLogs).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            console.error(`[error] channelUpdate, ${err}, ${Date.now()}`);
        };
    }
};