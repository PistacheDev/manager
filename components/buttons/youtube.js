const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports =
{
    name: 'youtubeButton',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
            {
                if (data[0].youtubeNotification == null) return showFirstModal(); // The option is turned off for this server, so the user can't disable it.
                const [channelID, roleID, youtubeID, latestVideoID] = data[0].youtubeNotification.split(' '); // Read the data.

                if (roleID == 'null' || youtubeID == 'null') showSecondModal(); // The configuration isn't finished, so the user isn't allowed to disable it for now.
                else showFirstModal(); // The option is turned on, so the user is now allowed to disable it.

                // First modal (setup the channel).
                async function showFirstModal()
                {
                    const modal = new ModalBuilder()
                    .setCustomId('youtubeModal')
                    .setTitle('Setup the notifications:')

                    const modalOption = new TextInputBuilder()
                    .setCustomId('youtubeModalOption')
                    .setLabel('Channel ID:')
                    .setPlaceholder('To disable this option, let this field empty.')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                    const modalInput = new ActionRowBuilder()
                    .addComponents(modalOption)

                    modal.addComponents(modalInput);
                    await interaction.showModal(modal);
                };

                // Second modal (setup the role and the YouTube channel).
                async function showSecondModal()
                {
                    const modal = new ModalBuilder()
                    .setCustomId('youtubeSetupModal')
                    .setTitle('Setup the notifications:')

                    const modalOptionFirst = new TextInputBuilder()
                    .setCustomId('youtubeModalOptionFirst')
                    .setLabel('Role ID:')
                    .setPlaceholder('Enter a role ID or @everyone.')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalOptionSecond = new TextInputBuilder()
                    .setCustomId('youtubeModalOptionSecond')
                    .setLabel('YouTube channel:')
                    .setPlaceholder('Enter the channel URL (https://www.youtube.com/@example).')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInputFirst = new ActionRowBuilder()
                    .addComponents(modalOptionFirst);

                    const modalInputSecond = new ActionRowBuilder()
                    .addComponents(modalOptionSecond)

                    modal.addComponents(modalInputFirst, modalInputSecond);
                    await interaction.showModal(modal);
                };
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] youtubeButton, ${err}, ${Date.now()}`);
        };
    }
};