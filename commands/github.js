const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'github',
    type: 'application',
    ownerOnly: true,
    async run(client, db, interaction)
    {
        try
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
            .setAuthor({ name: 'Manager is an Open Source project!\nYou can contribute to the development!', iconURL: client.user.avatarURL() })

            interaction.reply({ embeds: [embed], components: [button] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] github, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Official GitHub repository.')
    }
};