const { EmbedBuilder } = require("discord.js");
const { antibots } = require("../guard/antibots");
const { autoraidmode } = require("../guard/autoraidmode");
const normalizer = require("replace-special-characters")

module.exports =
{
    name: "guildMemberAdd",
    async run(client, db, member)
    {
        const guild = member.guild;

        db.query("SELECT * FROM bans WHERE guild = ? AND user = ?", [guild.id, member.id], async (err, data) =>
        {
            if (err) throw err;

            if (data.length > 0)
            {
                member.ban({ reason: "This user was definitively banned. Run \"/bansdef remove\" to revoke the ban." });
                return;
            };
        });

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
        {
            if (err) throw err;
            if (data.length < 1) return;

            const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`:wave: Welcome to <@${member.id}> @${member.user.username} who has just **joined the server**!\n\n:clock7: **Exact date** of arrival: <t:${Math.floor(member.joinedAt / 1000)}:F>.\n:tada: Now, we are **${guild.memberCount} member(s)** on the server!`)
            .setThumbnail(member.user.avatarURL())

            if (data[0].memberAdd != 0) await guild.channels.cache.get(data[0].memberAdd).send({ embeds: [embed] });
            if (data[0].joinRole != 0) member.roles.add(data[0].joinRole);
            if (data[0].raidmode == 1) member.kick();
            if (data[0].antibots == 1 && member.user.bot) antibots(member);

            if (data[0].autoNormalizer == 1)
            {
                const normalized = normalizer(member.displayName);
                await member.setNickname(normalized);
            };

            autoraidmode(data, member);
        });
    }
};