const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'messageDelete',
    async run(client, db, message)
    {
        try
        {
            if (!message.guild) return; // If the message wasn't in server.
            setTimeout(() => {}, 100); // Wait for the new audit log.

            db.query('SELECT * FROM config WHERE guild = ?', [message.guild.id], async (err, data) =>
            {
                // Some verifications before continue.
                if (data.length < 1 || data[0].messagesLogs == null || message.author == null || message.author.bot) return;

                // Request the latest guild log for the MessageDelete event.
                const auditLog = await message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
                const log = auditLog.entries.first();

                const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Message deleted!')
                .setThumbnail(message.member.displayAvatarURL())
                .setImage(message.author.bannerURL())
                .addFields([{ name: ':speech_balloon:・Message Information:', value: `>>> **Author**: <@${message.author.id}> @${message.author.username}.\n**Channel**: <#${message.channel.id}> \`${message.channel.name}\`.\n**Sent Date**: <t:${Math.floor(message.createdAt / 1000)}:F>.\n**Deletion Date**: <t:${Math.floor(Date.now() - 100 / 1000)}:F>.` }])
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> <@${log.executorId}> @${message.guild.members.cache.get(log.executorId).user.username}` }])
                .addFields([{ name: ':scroll:・Message Content:', value: `\`\`\`${message.content == '' ? 'None' : message.content}\`\`\`` }])
                .addFields([{ name: ':paperclips:・IDs:', value: `>>> **Message**: ${message.id}.\n**Message Author**: ${message.author.id}.\n**Moderator**: ${log.executorId}.\n**Channel**: ${message.channel.id}.\n**Server**: ${message.guild.id}.` }])
                .setTimestamp()
                .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() })

                await message.guild.channels.cache.get(data[0].messagesLogs).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            console.error(`[error] messageDelete, ${err}, ${Date.now()}`);
        };
    }
};