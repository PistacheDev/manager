const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'youtubeModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                // Modal option.
                var newChannel = interaction.fields.getTextInputValue('youtubeModalOption');

                // Some verifications.
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');
                if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply(':warning: This channel doesn\'t exist or the application can\'t access it!');

                await db.query('UPDATE config SET youtubeNotifs = ? WHERE guild = ?', [!newChannel ? 0 : `${newChannel} 0 0 0`, guild.id], async () =>
                {
                    const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription('Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n>>> __**Now, you can also configure the application with the online dashboard**__ available on the official website of the application (*link provided below*).')
                    .addFields([{ name: ':video_camera:・YouTube Notifications:', value: `>>> **Status**: ${!newChannel ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${newChannel}>`}.\n**Notification Role**: Awaiting configuration.\n**YouTube Channel**: Awaiting configuration.\n**Function**: **Sends a message** in the **configured channel** when the **configured YouTube channel** releases a **new video**.` }])
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
            console.error(`[error] youtubeModal, ${err}, ${Date.now()}`);
        };
    }
};