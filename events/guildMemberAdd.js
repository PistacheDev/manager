const { EmbedBuilder } = require("discord.js");
const { antibots } = require("../guard/antibots");
const { autoraidmode } = require("../guard/autoraidmode");

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
                if (data[0].antibots == 1 && member.user.bot) antibots(member);
                autoraidmode(data, member);
            });
        }
        catch (err)
        {
            console.error(`[error] guildMemberAdd, ${err}, ${Date.now()}`);
        };
    }
};