const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports =
{
    name: 'guildCreate',
    async run(client, db, guild)
    {
        try
        {
            db.query('INSERT INTO config (`guild`) VALUES (?)', [guild.id]); // Insert the server in the database.

            // Check if the server has a main channel configured.
            if (guild.systemChannel)
            {
                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setURL('https://github.com/PistacheDev/manager')
                    .setLabel('GitHub')
                    .setStyle(ButtonStyle.Link)
                )
                .addComponents(
                    new ButtonBuilder()
                    .setURL('https://discord.com/invite/RkB3ZQsmGV')
                    .setLabel('Discord')
                    .setStyle(ButtonStyle.Link)
                )
                .addComponents(
                    new ButtonBuilder()
                    .setURL('https://manager.pistachedev.fr/dashboard')
                    .setLabel('Dashboard')
                    .setStyle(ButtonStyle.Link)
                )

                const embed = new EmbedBuilder()
                .setColor('Gold')
                .setAuthor({ name: `Thank you for choosing ${client.user.username} for your server!`, iconURL: client.user.avatarURL() })
                .setDescription(':information_source: __**Recommendations and Features.**__')
                .setThumbnail(guild.iconURL())
                .addFields([{ name: 'I - Cybersecurity', value: 'For cybersecurity reasons, please place the application role only above the necessary roles.' }])
                .addFields([{ name: 'II - Open Source', value: 'This application is fully Open Source! You can contribute to it or read the code if you wish, directly on GitHub.' }])
                .addFields([{ name: 'III - Development', value: 'The application is under development, so you may encounter bugs or malfunctions. To report them, we have a community Discord server.' }])
                .addFields([{ name: 'IV - Online Dashboard', value: 'The application can be configured using the \`/config\` command, but configuration can also be done via an online dashboard on the official website.' }])
                .setTimestamp()
                .setFooter({ text: `Manager v${config.version}.` })

                guild.systemChannel.send({ content: `<@${guild.ownerId}>`, embeds: [embed], components: [buttons] });
            };
        }
        catch(err)
        {
            console.error(`[error] guildCreate, ${err}, ${Date.now()}`);
        };
    }
};