const { PermissionsBitField, EmbedBuilder, messageLink } = require("discord.js");
const url = require("../url.json");
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: "messageUpdate",
    async run(client, db, oldMessage, newMessage)
    {
        try
        {
            if (!oldMessage.guild) return;

            // Shortcuts.
            const guild = oldMessage.guild;
            const author = oldMessage.author;
            const member = oldMessage.member;

            function antiLinks(data)
            {
                if (data[0].antilinks == 0) return false;
                if (data[0].antilinks == 1 && author.bot) return false;
                if (author.id == client.user.id) return false;
                if (author.id == guild.ownerId || member.permissions.has(Perms.Administrator)) return false;

                const content = newMessage.content.toLowerCase(); // Convert the text in lower cases.
                const containLink = url.keywords.some(keyword => content.includes(keyword)); // Search any URL keywords in the text.
                const isGif = content.includes("tenor.com"); // Check if the sent message 

                if (containLink && !isGif)
                {
                    oldMessage.delete().then(() =>
                    {
                        oldMessage.channel.send(`:warning: <@${author.id}>, links aren't allowed in this server!`);
                        return true;
                    });
                };

                return false;
            };

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return;

                const containLink = antiLinks(data);
                if (containLink || data[0].messagesLogs == 0 || oldMessage.author == null || oldMessage.author.bot || oldMessage.content == newMessage.content) return;

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
        catch (err)
        {
            console.error(`[error] messageUpdate, ${err}, ${Date.now()}`);
        };
    }
};