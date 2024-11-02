const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'bansLogsModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                // Modal option.
                var newChannel = interaction.fields.getTextInputValue('bansLogsModalOption');

                // Some verifications.
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');
                if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply(':warning: This channel doesn\'t exist or the application can\'t access it!');

                db.query('UPDATE config SET bansLogs = ? WHERE guild = ?', [newChannel ? newChannel : 0, guild.id], async () =>
                {
                    const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                    .addFields([{ name: ':speech_balloon:・Messages Logs:', value: `>>> **Status**: ${data[0].messagesLogs == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].messagesLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a message is **deleted** or **edited**.` }])
                    .addFields([{ name: ':keyboard:・Channels Logs:', value: `>>> **Status**: ${data[0].channelsLogs == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].channelsLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a channel is **created**, **deleted**, or **edited**.` }])
                    .addFields([{ name: ':scales:・Bans Logs:', value: `>>> **Status**: ${!newChannel ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${newChannel}>`}.\n**Function**: **Sends a log** in the **configured channel** when a ban is **issued** or **revoked**.` }])
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
            console.error(`[error] bansLogsModal, ${err}, ${Date.now()}`);
        };
    }
};