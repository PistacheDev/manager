const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "socialmedia",
    type: "application",
    async run(client, db, interaction)
    {
        try
        {
            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setThumbnail(client.user.avatarURL())
            .setDescription("# Official links:\n\n・**Website**: https://manager.pistachedev.fr.\n・**GitHub**: https://github.com/PistacheDev/manager.\n・**Discord**: https://discord.com/invite/RkB3ZQsmGV")

            interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Official social media links.")
    }
};