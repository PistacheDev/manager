const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'messagesLogsModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            let embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
            .setThumbnail(client.user.avatarURL())
            .setDescription('Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n>>> __**Now, you can also configure the application with the online dashboard**__ available on the official website of the application (*link provided below*).')
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

            db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
            {
                // Some verifications.
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');
                var newChannel = interaction.fields.getTextInputValue('messagesLogsModalOption');
                if (newChannel && !interaction.guild.channels.cache.get(newChannel)) return interaction.reply(':warning: This channel doesn\'t exist or the application can\'t access it!');

                db.query('UPDATE config SET messagesLogs = ? WHERE guild = ?', [!newChannel ? null : newChannel, interaction.guild.id], async () =>
                {
                    // Generate the fields.
                    embed.addFields([{ name: ':speech_balloon:・Messages Logs:', value: `>>> **Status**: ${!newChannel ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${newChannel}>`}.\n**Function**: **Sends a log** in the **configured channel** when a message is **deleted** or **edited**.` }])
                    embed.addFields([{ name: ':keyboard:・Channels Logs:', value: `>>> **Status**: ${data[0].channelsLogs == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].channelsLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a channel is **created**, **deleted**, or **edited**.` }])
                    embed.addFields([{ name: ':scales:・Bans Logs:', value: `>>> **Status**: ${data[0].bansLogs == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].bansLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a ban is **issued** or **revoked**.` }])

                    await interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate(); // To avoid an error.
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] messagesLogsModal, ${err}, ${Date.now()}`);
        };
    }
};