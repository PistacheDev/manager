const { Collection } = require('discord.js');
const fs = require('fs');
const { PermissionsBitField } = require('discord.js');
const Perms = PermissionsBitField.Flags; // Shortcut.

// Create a class to contain every commands and components.
class Scripts
{
    constructor()
    {
        this.list = new Collection(); // Create a Discord Collection.
        const commandsScripts = fs.readdirSync('./commands').filter(scripts => scripts.endsWith('.js'));
        const componentsFolders = ['buttons', 'menus', 'modals']; // List of folders in the "components" folder.

        for (const command of commandsScripts)
        {
            const commandScript = require(`../commands/${command}`);
            if (commandScript.name && commandScript) this.list.set(commandScript.name, commandScript); // Add the command to the list if it's valid.
        };

        // Scan each components folders.
        componentsFolders.forEach(folder =>
        {
            const componentsScripts = fs.readdirSync(`./components/${folder}`).filter(scripts => scripts.endsWith('.js'));

            for (const component of componentsScripts)
            {
                const componentScript = require(`../components/${folder}/${component}`);
                if (componentScript.name && componentScript) this.list.set(componentScript.name, componentScript); // Add the commponent to the list if it's valid.
            };
        });
    };
};

module.exports =
{
    name: 'interactionCreate',
    scripts: new Scripts(), // Import the Scripts class.
    async run(client, db, interaction)
    {
        try
        {
            if (!interaction.guild) return; // If this interaction isn't in a guild.

            let script = this.scripts.list.get(interaction.commandName); // Search a corresponding script in the scripts list with the command name.
            if (!script) script = this.scripts.list.get(interaction.customId); // If nothing correspond, try again with the interaction customId.
            if (!script) return interaction.reply(':warning: Unknown **interaction**!'); // If still nothing, return an error.

            // Some permissions verifications.
            if (script.permission && !interaction.member.permissions.has(script.permission) && !interaction.member.permissions.has(Perms.Administrator) && interaction.user.id != interaction.guild.ownerId) return interaction.reply(':warning: Vous n\'avez pas les permissions requises pour faire cette interaction.');
            if (script.ownerOnly && interaction.user.id != interaction.guild.ownerId) return interaction.reply(`:warning: Cette interaction est **réservée au propriétaire** du serveur.`);

            console.log(`[debug] interactionCreate, ${script.name}, ${interaction.guild.id}, ${interaction.user.id}, ${Date.now()}`);
            await script.run(client, db, interaction); // Run the script.
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error], interactionCreate, ${err}, ${Date.now()}`);
        };
    }
};