const fs = require('fs');
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { youtubeNotifications } = require('../api/youtube');

module.exports =
{
    name: 'ready',
    once: true,
    async run(client, db)
    {
        try
        {
            const commandsScripts = fs.readdirSync('./commands').filter(scripts => scripts.endsWith('.js'));
            const clientCommands = [];
            const rest = new REST({ version: '10' }).setToken(process.env.APP_TOKEN); // Create a rest for the commands dynamic deployment.

            for (const command of commandsScripts)
            {
                const commandScript = require(`../commands/${command}`);
                if (commandScript.data) clientCommands.push(commandScript.data.toJSON()); // Add the command information to the list.
            };

            console.log(`[debug] ${clientCommands.length} commands were successfully deployed!`);
            rest.put( Routes.applicationCommands(client.user.id), { body: clientCommands } ).catch(console.error); // Deploy the commands.
            console.log(`[debug] Logged to Discord as ${client.user.username} (${client.user.id})!`);

            youtubeNotifications();
            setInterval(youtubeNotifications, 300000); // Run the YouTube notifications system every 5 minutes.
        }
        catch (err)
        {
            console.error(`[error] ready, ${err}, ${Date.now()}`);
        };
    }
};