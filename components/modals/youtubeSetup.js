const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports =
{
    name: 'youtubeSetupModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
            {
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');

                // Modal options.
                const roleID = interaction.fields.getTextInputValue('youtubeModalOption');
                const channelURL = interaction.fields.getTextInputValue('youtubeModalOption2');

                const channelID = data[0].youtubeNotifs.split(' ')[0];
                if (roleID != '@everyone' && !interaction.guild.roles.cache.get(roleID)) return interaction.reply(':warning: This role doesn\'t exist!');

                const request = await axios.get(`${channelURL}/videos`);
                const html = cheerio.load(request.data).html(); // Convert the data in HTML.

                // Fetch required informations.
                const regex = /"webCommandMetadata":{"url":"\/watch\?v=([^"]+)"/;
                const latestVideoID = `${html.match(regex) ? html.match(regex)[1] : null}`;
                const youtubeID = html.match(/"channelUrl":"([^"]+)"/)[1].split('channel/')[1];

                await db.query('UPDATE config SET youtubeNotifs = ? WHERE guild = ?', [`${channelID} ${roleID} ${youtubeID} ${latestVideoID}`, interaction.guild.id], async () =>
                {
                    const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription('Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n>>> __**Now, you can also configure the application with the online dashboard**__ available on the official website of the application (*link provided below*).')
                    .addFields([{ name: ':video_camera:・YouTube Notifications:', value: `>>> **Status**: :white_check_mark: Active.\n**Configured Channel**: <#${channelID}>.\n**Notification Role**: <@&${roleID}>.\n**YouTube Channel**: ${youtubeID}.\n**Function**: **Sends a message** in the **configured channel** when the **configured YouTube channel** releases a **new video**.` }])
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    await interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] youtubeSetupModal, ${err}, ${Date.now()}`);
        };
    }
};