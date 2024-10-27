const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildBanRemove',
    async run(client, db, ban)
    {
        try
        {
            setTimeout(() => {}, 100); // Wait for the new audit log.
            const guild = ban.guild; // Shortcut.

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                if (data.length < 1 || data[0].bansLogs == 0) return; // Some database verifications.

                // Request the latest server log for the MemberBanRemove event.
                const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
                const log = auditLogs.entries.first();

                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('Ban Revocation!')
                .setThumbnail(ban.user.displayAvatarURL())
                .setImage(ban.user.bannerURL())
                .addFields([{ name: ':airplane_departure:・Unbanned User:', value: `>>> **Identity**: <@${ban.user.id}> @${ban.user.username}.\n**Account Creation**: <t:${Math.floor(ban.user.createdAt / 1000)}:F>.\n**Bot**: ${ban.user.bot ? 'Yes' : 'No'}.` }])
                .addFields([{ name: ':man_judge:・Moderator:', value: `>>> **Identity**: <@${log.executorId}> @${guild.members.cache.get(log.executorId).user.username}.\n**Bot**: ${guild.members.cache.get(log.executorId).user.bot ? 'Yes' : 'No'}.` }])
                .addFields([{ name: ':paperclips:・IDs:', value: `>>> **Banned**: ${ban.user.id}.\n**Moderator**: ${log.executorId}.\n**Server**: ${guild.id}.` }])
                .setTimestamp()
                .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() })

                await guild.channels.cache.get(data[0].bansLogs).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            console.error(`[error] guildBanRemove, ${err}, ${Date.now()}`);
        };
    }
};