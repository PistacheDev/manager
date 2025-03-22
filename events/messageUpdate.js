const { EmbedBuilder } = require("discord.js");
const { antilinks } = require("../guard/antilinks");
const { antiswear } = require("../guard/antiswear");

module.exports =
{
    name: "messageUpdate",
    async run(client, db, oldMessage, newMessage)
    {
        if (!oldMessage.guild || oldMessage.author == null || oldMessage.author.bot || oldMessage.content == newMessage.content) return;
        const guild = oldMessage.guild;

        const isInsulting = await antiswear(newMessage);
        const containLink = await antilinks(newMessage);
        if (isInsulting || containLink) return;

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
        {
            if (err) throw err;
            if (data.length < 1 || data[0].messagesLogs == 0) return;

            if (!guild.channels.cache.get(data[0].messagesLogs))
            {
                db.query("UPDATE config SET messagesLogs = ? WHERE guild = ?", [0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    return;
                });
            };

            const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Message modified!")
            .setThumbnail(oldMessage.member.displayAvatarURL())
            .setImage(oldMessage.author.bannerURL())
            .addFields([{ name: ":speech_balloon:・Informations:", value: `>>> **Author**: <@${oldMessage.author.id}> @${oldMessage.member.user.username}.\n**Channel**: <#${oldMessage.channel.id}> \`${oldMessage.channel.name}\`.\n**Sent Date**: <t:${Math.floor(oldMessage.createdAt / 1000) }:F>` }])
            .addFields([{ name: ":scroll:・Old Message Content:", value: `\`\`\`${oldMessage.content == "" ? "None" : oldMessage.content}\`\`\`` }])
            .addFields([{ name: ":pencil:・New Message Content:", value: `\`\`\`${newMessage.content == "" ? "None" : newMessage.content}\`\`\`` }])
            .addFields([{ name: ":paperclips:・IDs:", value: `>>> **Message**: ${oldMessage.id}.\n**Message Author**: ${oldMessage.author.id}.\n**Channel**: ${oldMessage.channel.id}.\n**Server**: ${guild.id}.` }])
            .setTimestamp()
            .setFooter({ text: `Cybersecurity with ${client.user.username}`, iconURL: client.user.avatarURL() })

            await guild.channels.cache.get(data[0].messagesLogs).send({ embeds: [embed] });
        });
    }
};