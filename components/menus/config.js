const { PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { fixMissingConfig } = require('../../functions/missingConfig');

module.exports =
{
    name: 'configMenu',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            var menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('configMenu')
                .setPlaceholder('Select a tab.')
                .setOptions([
                    { emoji: '🏡', label: 'Home', description: 'Return to home.', value: 'home' },
                    { emoji: '🛡️', label: 'Security', description: 'Configure security options.', value: 'security' },
                    { emoji: '🔨', label: 'Moderation', description: 'Configure moderation options.', value: 'moderation' },
                    { emoji: '📊', label: 'XP', description: 'Configure the XP system.', value: 'XP' },
                    { emoji: '🖇️', label: 'Connections', description: 'Configure external connections.', value: 'API' },
                    { emoji: '🛬', label: 'Members', description: 'Configure arrivals/departures.', value: 'members' },
                    { emoji: '📁', label: 'Logs', description: 'Configure logs.', value: 'logs' },
                    { emoji: '❌', label: 'Close', description: 'Close the configuration panel.', value: 'close' }
                ])
            )

            let embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
            .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = fixMissingConfig(guild);

                switch (interaction.values.toString())
                {
                    case 'home':
                        homeMenu();
                        break;

                    case 'security':
                        securityMenu(data[0]);
                        break;

                    case 'moderation':
                        moderationMenu(data[0]);
                        break;

                    case 'XP':
                        xpMenu(data[0]);
                        break;

                    case 'API':
                        apiMenu(data[0]);
                        break;

                    case 'members':
                        membersMenu(data[0]);
                        break;

                    case 'logs':
                        logsMenu(data[0]);
                        break;

                    case 'close':
                        interaction.message.delete();
                        break;

                    default:
                        interaction.reply(':warning: Unknown **tab**!');
                        break;
                };

                interaction.deferUpdate();
            });

            async function homeMenu()
            {
                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription('Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n>>> When you are in a **configuration tab**, press the button with the **emoji corresponding** to **the option** you want to modify.\nSome options has **several steps** to **properly configure** them.')
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                await interaction.message.edit({ embeds: [embed], components: [menu, button] });
            };

            async function securityMenu(data)
            {
                let status = ':x: Inactive';

                if (data.autoraidmode != 0) // Update the data if the option is enabled.
                {
                    const [maxMembers, interval] = data.autoraidmode.split(' ');
                    status = `:white_check_mark: Active.\n**Detection**: More than ${maxMembers} new members in ${interval} seconds`;
                };

                embed.addFields([{ name: ':closed_lock_with_key:・Raidmode:', value: `>>> **Status**: ${data.raidmode == 1 ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the arrival of **new members**.` }])
                embed.addFields([{ name: ':crossed_swords:・Auto raidmode:', value: `>>> **Status**: ${status}.\n**Function**: Enable the **raidmode** when **too many users** join the server in a **short period** of time.` }])
                embed.addFields([{ name: ':robot:・Anti bots:', value: `>>> **Status**: ${data.antibots == 1 ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the **addition of applications**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('raidmodeButton')
                    .setEmoji('🔐')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('autoraidmodeButton')
                    .setEmoji('⚔️')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('antibotButton')
                    .setEmoji('🤖')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function moderationMenu(data)
            {
                let status = ':x: Inactive';

                if (data.antispam != 0) // Update the data if the option is enabled.
                {
                    const [ignoreBots, maxMessages, interval, maxWarns, sanction] = data.antispam.split(' ');
                    status = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBots == 1 ? 'Yes' : 'No'}.\n**Spam Detection:** More than ${maxMessages} messages in ${interval} seconds.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} minutes`}`;
                };

                embed.addFields([{ name: ':hand_splayed:・Anti spam:', value: `>>> **Status**: ${status}.\n**Function**: Prevent the members from **spamming messages**.` }])
                status = ':x: Inactive';

                if (data.warn != '0')
                {
                    const [maxWarns, sanction] = data.warn.split(' ');
                    status = `:white_check_mark: Active.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} hours`}`;
                };

                embed.addFields([{ name: ':warning:・Warns:', value: `>>> **Status**: ${status}.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])
                status = ':x: Inactive';

                if (data.antipings != 0)
                {
                    const [ignoreBots, sanction] = data.antipings.split(' ');
                    status = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBots == 1 ? 'Yes' : 'No'}.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} minutes`}`;
                };

                embed.addFields([{ name: ':loud_sound:・Anti pings:', value: `>>> **Status**: ${status}.\n**Function**: Prevent the members from using **@everyone and @here**.` }])
                embed.addFields([{ name: ':globe_with_meridians:・Anti links:', value: `>>> **Status**: ${data.antilinks == 0 ? ':x: Inactive' : data.antilinks == 1 ? ':white_check_mark: Active' : ':lock: Enforced (bots too)'}.\n**Function**: Delete messages **containing links**.` }])

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
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('antipingsButton')
                    .setEmoji('🔊')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('antilinksButton')
                    .setEmoji('🌐')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function xpMenu(data)
            {
                let status = ':x: Inactive';

                if (data.xp != 0) // Update the data if the option is enabled.
                {
                    const [sendMessages, maxXP, maxLevel] = data.xp.split(' ');
                    status = `:white_check_mark: Active.\n**Alert when level up**: ${sendMessages == 0 ? 'No' : 'Yes'}.\n**XP per message**: Between 1 and ${maxXP}.\n**Maximum Level**: ${maxLevel == 0 ? 'None' : `Level ${maxLevel}`}`;
                };

                embed.addFields([{ name: ':gear:・XP system:', value: `>>> **Status**: ${status}.\n**Function**: Set the **application behavior** in the XP system.` }])
                let goals = '';

                for (let i = 0; i < 4; i++)
                {
                    const goal = data.xpgoals.split(' ')[i];
                    if (goal != 0) goals = `${goals}**Goal ${i + 1}/4**: Level ${goal.split('-')[0]} ➜ <@&${goal.split('-')[1]}>.${i < 3 ? '\n' : ''}`;
                    else goals = `${goals}**Goal ${i + 1}/4**: Not configured.${i < 3 ? '\n' : ''}`;
                };

                embed.addFields([{ name: ':trophy:・Goals:', value: `>>> ${goals}\n**Function**: When a member **reach a certain level**, the application **give a role**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('xpSettingsButton')
                    .setEmoji('⚙️')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('xpGoalsButton')
                    .setEmoji('🏆')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function apiMenu(data)
            {
                let status = ':x: Inactive';

                if (data.youtubeNotifs != 0) // Update the data if the ooption is enabled.
                {
                    const [channelID, roleID, youtubeID, latestVideoID] = data.youtubeNotifs.split(' ');
                    status = `:white_check_mark: Active.\n**Configured Channel**: <#${channelID}>.\n**Notification Role**: ${roleID == 0 ? 'Awaiting configuration' : roleID == '@everyone' ? '@everyone' : `<@&${roleID}>`}.\n**YouTube Channel**: ${youtubeID == 0 ? 'Awaiting configuration' : youtubeID}`;
                };

                embed.addFields([{ name: ':video_camera:・YouTube Notifications:', value: `>>> **Status**: ${status}.\n**Function**: **Sends a message** in the **configured channel** when the **configured YouTube channel** releases a **new video**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('youtubeButton')
                    .setEmoji('📹')
                    .setStyle(ButtonStyle.Primary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function membersMenu(data)
            {
                embed.addFields([{ name: ':airplane_arriving:・Arrival Messages:', value: `>>> **Status**: ${data.memberAdd == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data.memberAdd}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **joins the server**.` }])
                embed.addFields([{ name: ':envelope_with_arrow:・Arrival Role:', value: `>>> **Status**: ${data.joinRole == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Role**: <@&${data.joinRole}>`}.\n**Function**: **Assigns a role** to a user when they **join the server**.` }])
                embed.addFields([{ name: ':airplane_departure:・Departure Messages:', value: `>>> **Status**: ${data.memberRemove == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data.memberRemove}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **leaves the server**.` }])

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

            async function logsMenu(data)
            {
                embed.addFields([{ name: ':speech_balloon:・Messages Logs:', value: `>>> **Status**: ${data.messagesLogs == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data.messagesLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a message is **deleted** or **edited**.` }])
                embed.addFields([{ name: ':keyboard:・Channels Logs:', value: `>>> **Status**: ${data.channelsLogs == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data.channelsLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a channel is **created**, **deleted**, or **edited**.` }])
                embed.addFields([{ name: ':scales:・Bans Logs:', value: `>>> **Status**: ${data.bansLogs == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data.bansLogs}>`}.\n**Function**: **Sends a log** in the **configured channel** when a ban is **issued** or **revoked**.` }])

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