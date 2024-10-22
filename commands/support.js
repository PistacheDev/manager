const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'support',
    type: 'application',
    async run(client, db, interaction)
    {
        try
        {
            // Check what subcommand has been executed.
            switch (interaction.options.getSubcommand())
            {
                case 'github':
                    github();
                    break;

                case 'discord':
                    discord();
                    break;

                default:
                    interaction.reply(':warning: Unknown **command**!');
                    break;
            };

            function github()
            {
                var button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setURL('https://github.com/PistacheDev/manager')
                    .setLabel('GitHub')
                    .setStyle(ButtonStyle.Link)
                )

                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: 'Manager is an Open Source project!\nYou can contribute to the development directly on GitHub!', iconURL: client.user.avatarURL() })

                interaction.reply({ embeds: [embed], components: [button] });
            };

            function discord()
            {
                var button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('Invitation')
                    .setURL('https://discord.com/invite/RkB3ZQsmGV')
                    .setStyle(ButtonStyle.Link)
                )

                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: 'Join the Discord community!', iconURL: client.user.avatarURL() })

                interaction.reply({ embeds: [embed], components: [button] });
            };
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] support ${interaction.options.getSubcommand()}, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Support dedicated commands.')
        .addSubcommand(
            cmd => cmd
            .setName('discord')
            .setDescription('Official Discord server.')
        ).addSubcommand(
            cmd => cmd
            .setName('github')
            .setDescription('Official GitHub repository.')
        )
    }
};