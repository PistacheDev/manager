const { EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'messageUpdate',
    async run(client, db, oldMessage, newMessage)
    {
        try
        {
            if (!oldMessage.guild) return; // If the message isn't in a server.
            const guild = oldMessage.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                // Some verifications.
                if (data.length < 1 || data[0].messagesLogs == 0 || oldMessage.author == null || oldMessage.author.bot || oldMessage.content == newMessage.content) return;

                const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Message modified!')
                .setThumbnail(oldMessage.member.displayAvatarURL())
                .setImage(oldMessage.author.bannerURL())
                .addFields([{ name: ':speech_balloon:・Informations:', value: `>>> **Author**: <@${oldMessage.author.id}> @${oldMessage.member.user.username}.\n**Channel**: <#${oldMessage.channel.id}> \`${oldMessage.channel.name}\`.\n**Sent Date**: <t:${Math.floor(oldMessage.createdAt / 1000) }:F>` }])
                .addFields([{ name: ':scroll:・Old Message Content:', value: `\`\`\`${oldMessage.content == '' ? 'None' : oldMessage.content}\`\`\`` }])
                .addFields([{ name: ':pencil:・New Message Content:', value: `\`\`\`${newMessage.content == '' ? 'None' : newMessage.content}\`\`\`` }])
                .addFields([{ name: ':paperclips:・IDs:', value: `>>> **Message**: ${oldMessage.id}.\n**Message Author**: ${oldMessage.author.id}.\n**Channel**: ${oldMessage.channel.id}.\n**Server**: ${guild.id}.` }])
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