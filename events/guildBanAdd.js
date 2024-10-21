const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildBanAdd',
    async run(client, db, ban)
    {
        try
        {
            setTimeout(() => {}, 100); // Wait for the new audit log.

            db.query('SELECT * FROM config WHERE guild = ?', [ban.guild.id], async (err, data) =>
            {
                if (data.length < 1 || data[0].bansLogs == null) return; // Some database verifications.

                // Request the latest guild log for the MemberBanAdd event.
                const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
                const log = auditLogs.entries.first();

                const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('New Ban!')
                .setThumbnail(ban.user.displayAvatarURL())
                .setImage(ban.user.bannerURL())
                .addFields([{ name: ':airplane_departure:・Banned User:', value: `>>> **Identity**: <@${ban.user.id}> @${ban.user.username}.\n**Account Creation**: <t:${Math.floor(ban.user.createdAt / 1000)}:F>.\n**Bot**: ${ban.user.bot ? 'Yes' : 'No'}.` }])
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> **Identity**: <@${log.executorId}> @${ban.guild.members.cache.get(log.executorId).user.username}.\n**Bot**: ${ban.guild.members.cache.get(log.executorId).user.bot ? 'Yes' : 'No'}.` }])
                .addFields([{ name: ':scales:・Reason:', value: `\`\`\`${log.reason == null ? 'None' : log.reason}\`\`\`` }])
                .addFields([{ name: ':paperclips:・IDs:', value: `>>> **Banned**: ${ban.user.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${ban.guild.id}.` }])
                .setTimestamp()
                .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() })

                await ban.guild.channels.cache.get(data[0].bansLogs).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            console.error(`[error] guildBanAdd, ${err}, ${Date.now()}`);
        };
    }
};