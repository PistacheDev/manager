const { EmbedBuilder } = require('discord.js');

module.exports =
{
	name: 'guildMemberRemove',
	async run(client, db, member)
    {
        try
        {
            db.query('SELECT * FROM config WHERE guild = ?', [member.guild.id], async (err, data) =>
            {
                if (data.length < 1 || data[0].memberRemove == null) return; // Some database verifications.

                const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:wave: Goodbye to <@${member.id}> @${member.user.username} who has just **left the server**!\n\n:clock7: **Exact date** of departure: <t:${Math.floor(parseInt(Date.now() / 1000))}:F>.\n:tada: Now, we are **${member.guild.memberCount} member(s)** on the server!`)
                .setThumbnail(member.user.avatarURL())

                await member.guild.channels.cache.get(data[0].memberRemove).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            console.error(`[error] guildMemberRemove, ${err}, ${Date.now()}`);
        };
	}
};