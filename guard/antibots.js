const { AuditLogEvent } = require("discord.js");

async function antibots(member)
{
    const guild = member.guild;
    const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 }); // Fetch server logs.
    const results = auditLogs.entries;
    const log = results.find(entry => entry.targetId == member.id); // Fetch for the latest log with the member ID.

    if (!log) return member.kick(); // For security reasons, kick the bot if no log is available.
    if (log.executorId != guild.ownerId) member.kick(); // Kick the bot if it wasn't added by the owner.
};

module.exports =
{
    antibots
};