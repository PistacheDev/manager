const { PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'config',
    type: 'management',
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

            const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
            .setThumbnail(client.user.avatarURL())
            .setDescription('Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n>>> __**Now, you can also configure the application with the online dashboard**__ available on the official website of the application (*link provided below*).')
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            interaction.reply({ embeds: [embed], components: [menu] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] config, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Open the configuration panel.')
        .setDefaultMemberPermissions(this.permission)
    }
};