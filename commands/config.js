const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { configMenu } = require("../prefabs/configMenu");

module.exports =
{
    name: "config",
    type: "management",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        var menu = configMenu();

        const embed = new EmbedBuilder()
        .setColor("Orange")
        .setThumbnail(client.user.avatarURL())
        .setDescription("Configure the application with its configuration panel. Through the different tabs, you will find all the configurable options of Manager.\n\nIf you want to, you can even use [the online dashboard on the official website](https://manager.pistachedev.fr/dashboard).")

        interaction.reply({ embeds: [embed], components: [menu] });
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Open the configuration panel.")
        .setDefaultMemberPermissions(this.permission)
    }
};