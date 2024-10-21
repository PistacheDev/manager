const { EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'guildMemberAdd',
    async run(client, db, member)
    {
        try
        {
            db.query('SELECT * FROM config WHERE guild = ?', [member.guild.id], async (err, data) =>
            {
                if (data.length < 1) return; // Some database verifications.

                const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`:wave: Welcome to <@${member.id}> @${member.user.username} who has just **joined the server**!\n\n:clock7: **Exact date** of arrival: <t:${Math.floor(member.joinedAt / 1000)}:F>.\n:tada: Now, we are **${member.guild.memberCount} member(s)** on the server!`)
                .setThumbnail(member.user.avatarURL())

                // Check if the application has something special to do.
                if (data[0].memberAdd != null) await member.guild.channels.cache.get(data[0].memberAdd).send({ embeds: [embed] });
                if (data[0].joinRole != null) member.roles.add(data[0].joinRole);
                if (data[0].raidmode == 'true') member.kick();
                if (data[0].antibot == 'true' && member.user.bot) member.kick();
            });
        }
        catch (err)
        {
            console.error(`[error] guildMemberAdd, ${err}, ${Date.now()}`);
        };
    }
};