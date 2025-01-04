const { SlashCommandBuilder } = require("discord.js");

module.exports =
{
    name: "ping",
    type: "application",
    async run(client, db, interaction)
    {
        try
        {
            await interaction.reply(`:ping_pong: **Application Latency**: \`${client.ws.ping}\`ms.`);
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