const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "ping",
    type: "application",
    async run(client, db, interaction)
    {
        await interaction.reply({ content: `:ping_pong: Application Latency: ${client.ws.ping}ms.`, flags: MessageFlags.Ephemeral });
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Application latency.")
    }
};