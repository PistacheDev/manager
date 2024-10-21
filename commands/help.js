const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'help',
    type: 'application',
    async run(client, db, interaction)
    {
        try
        {
            var menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('helpMenu')
                .setPlaceholder('Sélectionnez un onglet.')
                .setOptions([
                    { emoji: '🏡', label: 'Home', description: 'Return to home.', value: 'home' },
                    { emoji: '👑', label: 'Management', description: 'Management commands.', value: 'management' },
                    { emoji: '👮', label: 'Moderation', description: 'Moderation commands.', value: 'moderation' },
                    { emoji: '🛠️', label: 'Utilities', description: 'Utilities commands.', value: 'utility' },
                    { emoji: '🕹️', label: 'Games', description: 'Game commands.', value: 'gaming' },
                    { emoji: '🤖', label: 'Application', description: 'Commands dedicated to the application.', value: 'application' },
                    { emoji: '❌', label: 'Close', description: 'Close the assistance menu.', value: 'close' }
                ])
            );

            var button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setLabel('Official Website')
                .setURL('https://manager.pistachedev.fr')
                .setStyle(ButtonStyle.Link)
            );

            const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: 'Assistance menu', iconURL: client.user.avatarURL() })
            .setThumbnail(client.user.avatarURL())
            .setDescription('Quickly obtain the list of **commands by categories**! \nTo configure the application, run `/config`! \nYou can **navigate between the tabs** with the selective menu below. >>> To manage the application **more easily**, use the website! \nThe URL is **present** with the button **below**.')
            .setTimestamp()
            .setFooter({ text: `Executed by @${interaction.user.username}`, iconURL: interaction.user.avatarURL() })

            interaction.reply({ embeds: [embed], components: [menu, button] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] help, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Assistance menu.')
    }
};