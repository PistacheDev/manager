const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'socialmedia',
    type: 'application',
    async run(client, db, interaction)
    {
        try
        {
            const embed = new EmbedBuilder()
            .setColor('Orange')
            .setThumbnail(client.user.avatarURL())
            .setDescription('# Official links:\n\n・**Website**: https://manager.pistachedev.fr.\n・**GitHub**: https://github.com/PistacheDev/manager.\n・**Discord**: https://discord.com/invite/RkB3ZQsmGV')

            interaction.reply({ embeds: [embed] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] socialmedia, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Official social media links.')
    }
};