const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'warnModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const maxWarns = interaction.fields.getTextInputValue('warnModalOptionFirst');
            const sanction = interaction.fields.getTextInputValue('warnModalOptionSecond');

            // Some verifications.
            if (isNaN(maxWarns) || (sanction != 'ban' && isNaN(sanction))) return interaction.reply(':warning: Please! Enter a **number**!');
            if (maxWarns < 2 || maxWarns > 10) return interaction.reply(':warning: The maximum warns count must be **between 2 and 10 warns**!');
            if (sanction != 'ban' && (sanction < 1 || sanction > 168)) return interaction.reply(':warning: The mute can\'t last **less than 1 hour** or **longer than 7 days (168)**!');

            db.query('UPDATE config SET warn = ? WHERE guild = ?', [`true ${maxWarns} ${sanction}`, interaction.guild.id], async () =>
            {
                db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
                {
                    let statut = ':x: Inactive';

                    if (data[0].antispam != 'false')
                    {
                        const [_, ignoreBot, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(' ');
                        statut = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBot == 'true' ? 'Yes' : 'No'}.\n**Spam Detection:** More than ${maxMessages} messages in ${interval} seconds.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} minutes`}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                    .addFields([{ name: ':hand_splayed:・Anti spam:', value: `>>> **Status**: ${statut}.\n**Function**: Prevent the members from **spamming messages**.` }])
                    .addFields([{ name: ':warning:・Warns:', value: `>>> **Status**: :white_check_mark: Active.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} hours`}.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])
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
            console.error(`[error] warnModal, ${err}, ${Date.now()}`);
        };
    }
};