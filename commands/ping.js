const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "ping",
    type: "application",
    async run(client, db, interaction)
    {
        try
        {
            await interaction.reply({ content: `:ping_pong: Application Latency: ${client.ws.ping}ms.`, flags: MessageFlags.Ephemeral });
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
        .setDescription("Application latency.")
    }
};