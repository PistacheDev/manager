const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'warnButton',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            db.query(`SELECT * FROM config WHERE guild = ?`, [interaction.guild.id], async (err, data) =>
            {
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');

                if (data[0].warn == 'false')
                {
                    const modal = new ModalBuilder()
                    .setCustomId('warnModal')
                    .setTitle('Setup the anti spam:')

                    const modalOptionFirst = new TextInputBuilder()
                    .setCustomId('warnModalOptionFirst')
                    .setLabel('Maximum warns:')
                    .setPlaceholder('Maximum number of warns before the sanction.')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInputFirst = new ActionRowBuilder()
                    .addComponents(modalOptionFirst)

                    const modalOptionSecond = new TextInputBuilder()
                    .setCustomId('warnModalOptionSecond')
                    .setLabel('Sanction:')
                    .setPlaceholder('Enter "ban" to ban or a number (in hours) to mute.')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInputSecond = new ActionRowBuilder()
                    .addComponents(modalOptionSecond)

                    modal.addComponents(modalInputFirst, modalInputSecond);
                    await interaction.showModal(modal);
                }
                else
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
                    .addFields([{ name: ':warning:・Warns:', value: `>>> **Status**: :x: Inactive.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                    // Update the data in the database.
                    db.query('UPDATE config SET warn = ? WHERE guild = ?', ['false', interaction.guild.id], async () =>
                    {
                        interaction.message.edit({ embeds: [embed] });
                        interaction.deferUpdate(); // To avoid an error.
                    });
                };
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] warnButton, ${err}, ${Date.now()}`);
        };
    }
};