const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports =
{
    name: 'configMenu',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            var menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('configMenu')
                .setPlaceholder('Select a tab.')
                .setOptions([
                    { emoji: '🏡', label: 'Home', description: 'Return to home.', value: 'home' },
                    { emoji: '🛡️', label: 'Security', description: 'Configure security options.', value: 'security' },
                    { emoji: '🔨', label: 'Sanctions', description: 'Configure automatic sanctions.', value: 'sanctions' },
                    { emoji: '🖇️', label: 'Connections', description: 'Configure external connections.', value: 'API' },
                    { emoji: '🛬', label: 'Members', description: 'Configure arrivals/departures.', value: 'members' },
                    { emoji: '📁', label: 'Logs', description: 'Configure logs.', value: 'logs' },
                    { emoji: '❌', label: 'Close', description: 'Close the configuration panel.', value: 'close' }
                ])
            )

            let embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
            .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

            db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
            {
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');

                switch (interaction.values.toString())
                {
                    case 'home':
                        homeMenu();
                        break;

                    case 'security':
                        securityMenu(data);
                        break;

                    case 'sanctions':
                        sanctionsMenu(data);
                        break;

                    case 'API':
                        apiMenu(data);
                        break;

                    case 'members':
                        membersMenu(data);
                        break;

                    case 'logs':
                        logsMenu(data);
                        break;

                    case 'close':
                        interaction.message.delete();
                        break;

                    default:
                        interaction.reply(':warning: Unknown **tab**!');
                        break;
                };

                interaction.deferUpdate(); // To avoid an error.
            });

            // Render the home menu.
            async function homeMenu()
            {
                var button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setURL(`https://manager.pistachedev.fr/dashboard`)
                    .setLabel('Dashboard')
                    .setStyle(ButtonStyle.Link)
                )

                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription('Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n>>> __**Now, you can also configure the application with the online dashboard**__ available on the official website of the application (*link provided below*).')
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

                await interaction.message.edit({ embeds: [embed], components: [menu, button] });
            };

            // Render the security menu.
            async function securityMenu(data)
            {
                embed.addFields([{ name: ':closed_lock_with_key:・Raidmode:', value: `>>> **Status**: ${data[0].raidmode == 'true' ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the arrival of **new members**.` }]);
                embed.addFields([{ name: ':robot:・Anti-bot:', value: `>>> **Status**: ${data[0].antibot == 'true' ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the **addition of applications**.` }]);

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('raidmodeButton')
                    .setEmoji('🔐')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('antibotButton')
                    .setEmoji('🤖')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            // Render the sanctions menu.
            async function sanctionsMenu(data)
            {
                let statut = ':x: Inactive';

                if (data[0].antispam != 'false')
                {
                    const [_, ignoreBot, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(' ');
                    statut = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBot == 'true' ? 'Yes' : 'No'}.\n**Spam Detection:** More than ${maxMessages} messages in ${interval} seconds.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} minutes`}`;
                };

                embed.addFields([{ name: ':hand_splayed:・Anti spam:', value: `>>> **Status**: ${statut}.\n**Function**: Prevent the members from **spamming messages**.` }])
                statut = ':x: Inactive';

                if (data[0].warn != 'false')
                {
                    const [_, maxWarns, sanction] = data[0].warn.split(' ');
                    statut = `:white_check_mark: Active.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} hours`}`;
                };

                embed.addFields([{ name: ':warning:・Warns:', value: `>>> **Status**: ${statut}.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('antispamButton')
                    .setEmoji('🖐️')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('warnButton')
                    .setEmoji('⚠️')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            // Render the API menu.
            async function apiMenu(data)
            {
                let statut = ':x: Inactive';

                if (data[0].youtubeNotification != null)
                {
                    const [channelID, roleID, youtubeID, latestVideoID] = data[0].youtubeNotification.split(' ');
                    statut = `:white_check_mark: Active.\n**Configured Channel**: ${channelID == null ? 'Awaiting configuration' : `<#${channelID}>`}.\n**Notification Role**: ${roleID == 'null' ? 'Awaiting configuration' : roleID == '@everyone' ? '@everyone' : `<@&${roleID}>`}.\n**YouTube Channel**: ${youtubeID == 'null' ? 'Awaiting configuration' : youtubeID}`;
                };

                embed.addFields([{ name: ':video_camera:・YouTube Notifications:', value: `>>> **Status**: ${statut}.\n**Function**: **Sends a message** in the **configured channel** when the **configured YouTube channel** releases a **new video**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('youtubeButton')
                    .setEmoji('📹')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            // Render the members menu.
            async function membersMenu(data)
            {
                embed.addFields([{ name: ':airplane_arriving:・Arrival Messages:', value: `>>> **Status**: ${data[0].memberAdd == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].memberAdd}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **joins the server**.` }])
                embed.addFields([{ name: ':envelope_with_arrow:・Arrival Role:', value: `>>> **Status**: ${data[0].joinRole == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Role**: <@&${data[0].joinRole}>`}.\n**Function**: **Assigns a role** to a user when they **join the server**.` }])
                embed.addFields([{ name: ':airplane_departure:・Departure Messages:', value: `>>> **Status**: ${data[0].memberRemove == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].memberRemove}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **leaves the server**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('memberAddButton')
                    .setEmoji('🛬')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('joinRoleButton')
                    .setEmoji('📩')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('memberRemoveButton')
                    .setEmoji('🛫')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            // Render the logs menu.
            async function logsMenu(data)
            {
                embed.addFields([{ name: ':speech_balloon:・Messages Logs:', value: `>>> **Status**: ${data[0].messagesLogs == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].messagesLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a message is **deleted** or **edited**.` }])
                embed.addFields([{ name: ':keyboard:・Channels Logs:', value: `>>> **Status**: ${data[0].channelsLogs == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].channelsLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a channel is **created**, **deleted**, or **edited**.` }])
                embed.addFields([{ name: ':scales:・Bans Logs:', value: `>>> **Status**: ${data[0].bansLogs == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].bansLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a ban is **issued** or **revoked**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('messagesLogsButton')
                    .setEmoji('💬')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('channelsLogsButton')
                    .setEmoji('⌨️')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('bansLogsButton')
                    .setEmoji('⚖️')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] configMenu, ${err}, ${Date.now()}`);
        };
    }
};