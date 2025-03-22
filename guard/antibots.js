const { AuditLogEvent } = require("discord.js");

async function antibots(member)
{
    const guild = member.guild;
    const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 });
    const results = auditLogs.entries;
    const log = results.find(entry => entry.targetId == member.id);

    if (!log) return member.kick();
    if (log.executorId != guild.ownerId) member.kick();
};

module.exports =
{
    antibots
};