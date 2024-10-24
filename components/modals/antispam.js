const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'antispamModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const ignoreBots = interaction.fields.getTextInputValue('antispamModalOptionFirst');
            const maxMessages = interaction.fields.getTextInputValue('antispamModalOptionSecond');
            const interval = interaction.fields.getTextInputValue('antispamModalOptionThird');
            const maxWarns = interaction.fields.getTextInputValue('antispamModalOptionFourth');
            const sanction = interaction.fields.getTextInputValue('antispamModalOptionFifth');

            // Some verifications.
            if (ignoreBots != 'yes' && ignoreBots != 'no') return interaction.reply(':warning: Your answer for the **Ignore Bots** option is invalid!');
            if (isNaN(maxMessages) || isNaN(interval) || isNaN(maxWarns) || (sanction != 'ban' && isNaN(sanction))) return interaction.reply(':warning: Please! Enter a **number**!');
            if (maxMessages < 1 || maxMessages > 10) return interaction.reply(':warning: The maximum messages must be **between 1 and 10 messages**!');
            if (interval < 1 || interval > 10) return interaction.reply(':warning: The interval must be **between 1 and 10 seconds**!');
            if (maxWarns < 1 || maxWarns > 5) return interaction.reply(':warning: The maximum warns must be **between 1 and 5 warns**!');
            if (sanction != 'ban' && (sanction < 1 || sanction > 70560)) return interaction.reply(':warning: The mute can\'t last **less than 1 minute** or **longer than 7 days (70560)**!');

            db.query('UPDATE config SET antispam = ? WHERE guild = ?', [`true ${ignoreBots == 'yes' ? true : false} ${maxMessages} ${interval} ${maxWarns} ${sanction}`, interaction.guild.id], async () =>
            {
                db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
                {
                    let statut = ':x: Inactive';

                    if (data[0].warn != 'false')
                    {
                        const [_, maxWarns, sanction] = data[0].warn.split(' ');
                        statut = `:white_check_mark: Active.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} hours`}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                    .addFields([{ name: ':hand_splayed:・Anti spam:', value: `>>> **Status**: :white_check_mark: Active.\n**Ignore Bots**: ${ignoreBots == 'yes' ? 'Yes' : 'No'}.\n**Spam Detection:** More than ${maxMessages} messages in ${interval} seconds.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} minutes`}.\n**Function**: Prevent the members from **spamming messages**.` }])
                    .addFields([{ name: ':warning:・Warns:', value: `>>> **Status**: ${statut}.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate(); // To avoid an error.
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] antispamModal, ${err}, ${Date.now()}`);
        };
    }
};