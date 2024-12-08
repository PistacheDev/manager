const { EmbedBuilder, AuditLogEvent } = require("discord.js");

// Map for the auto raidmode.
const newMembers = new Map();

module.exports =
{
    name: "guildMemberAdd",
    async run(client, db, member)
    {
        try
        {
            const guild = member.guild;

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return;

                const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`:wave: Welcome to <@${member.id}> @${member.user.username} who has just **joined the server**!\n\n:clock7: **Exact date** of arrival: <t:${Math.floor(member.joinedAt / 1000)}:F>.\n:tada: Now, we are **${guild.memberCount} member(s)** on the server!`)
                .setThumbnail(member.user.avatarURL())

                // Check if the application has something special to do.
                if (data[0].memberAdd != 0) await guild.channels.cache.get(data[0].memberAdd).send({ embeds: [embed] });
                if (data[0].joinRole != 0) member.roles.add(data[0].joinRole);
                if (data[0].raidmode == 1) member.kick();
                if (data[0].antibots == 1 && member.user.bot)
                {
                    const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 }); // Fetch server logs.
                    const results = auditLogs.entries;
                    const log = results.find(entry => entry.targetId == member.id); // Fetch for the latest log with the member ID.

                    if (!log) member.kick(); // For security reasons, kick the bot if no log is available.
                    if (log && log.executorId != guild.ownerId) member.kick(); // Kick the bot if it wasn't added by the owner.
                };

                if (data[0].raidmode == 0 && data[0].autoraidmode != 0)
                {
                    const [maxMembers, interval] = data[0].autoraidmode.split(" ");
                    const now = Date.now();
                    const timestamps = newMembers.get(guild.id) || [];
                    const filter = timestamps.filter(timestamp => now - timestamp < interval * 1000);

                    // Add the member to the Map.
                    filter.push(now);
                    newMembers.set(guild.id, filter);

                    if (filter.length >= maxMembers) // Limit exceeded.
                    {
                        db.query("UPDATE config SET raidmode = ? WHERE guild = ?", [1, guild.id], async (err) =>
                        {
                            if (err) throw err;
                        });
                    };
                };
            });
        }
        catch (err)
        {
            console.error(`[error] guildMemberAdd, ${err}, ${Date.now()}`);
        };
    }
};