const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'community',
    type: 'application',
    async run(client, db, interaction)
    {
        try
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
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] community, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Discord community invitation.')
    }
};