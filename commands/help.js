const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { helpMenu } = require("../prefabs/helpMenu");

module.exports =
{
    name: "help",
    type: "application",
    async run(client, db, interaction)
    {
        var menu = helpMenu();

        const embed = new EmbedBuilder()
        .setColor("Orange")
        .setThumbnail(client.user.avatarURL())
        .setDescription("Quickly obtain the list of commands by categories! To configure the application, run `/config`!\n\nYou can navigate between the tabs with the selection menu below.")

        interaction.reply({ embeds: [embed], components: [menu] });
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Assistance menu.")
    }
};