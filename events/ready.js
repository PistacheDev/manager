const fs = require("fs");
const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { youtubeNotifications } = require("../api/youtube");
const { twitchNotifications } = require("../api/twitch");

module.exports =
{
    name: "ready",
    once: true,
    async run(client, db)
    {
        try
        {
            const commandsScripts = fs.readdirSync("./commands").filter(scripts => scripts.endsWith(".js"));
            const clientCommands = [];
            const rest = new REST({ version: "10" }).setToken(process.env.APP_TOKEN); // Create a rest for the commands dynamic deployment.

            for (const command of commandsScripts)
            {
                const commandScript = require(`../commands/${command}`);
                if (commandScript.data) clientCommands.push(commandScript.data.toJSON()); // Add the command information to the list.
            };

            console.log(`[debug] ${clientCommands.length} commands were successfully deployed!`);
            rest.put( Routes.applicationCommands(client.user.id), { body: clientCommands } ).catch(console.error); // Deploy the commands.
            console.log(`[debug] Logged into Discord as ${client.user.id} aka ${client.user.username}!`);

            // Run the notifications system at startup.
            youtubeNotifications();
            twitchNotifications();

            setInterval(() => // Run the notifications system every 5 minutes.
            {
                youtubeNotifications();
                twitchNotifications();
            }, 300000);
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};