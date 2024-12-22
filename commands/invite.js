const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js");

module.exports =
{
    name: "invite",
    type: "application",
    async run(client, db, interaction)
    {
        try
        {
            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription("Install **the application** on your **server**!")

            var button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setURL("https://discord.com/oauth2/authorize?client_id=1211390696334958654&permissions=8&integration_type=0&scope=bot+applications.commands")
                .setLabel("Invitation")
                .setStyle(ButtonStyle.Link)
            )

            interaction.reply({ embeds: [embed], components: [button] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] invite, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Install the application on your server!")
    }
};