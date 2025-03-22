const { Collection } = require("discord.js");
const fs = require("fs");
const { PermissionsBitField, MessageFlags } = require("discord.js");
const Perms = PermissionsBitField.Flags;

class Scripts
{
    constructor()
    {
        this.list = new Collection();
        const commandsScripts = fs.readdirSync("./commands").filter(scripts => scripts.endsWith(".js"));
        const componentsFolders = ["buttons", "menus", "modals"];

        for (const command of commandsScripts)
        {
            const commandScript = require(`../commands/${command}`);
            if (commandScript.name && commandScript) this.list.set(commandScript.name, commandScript);
        };

        componentsFolders.forEach(folder =>
        {
            const componentsScripts = fs.readdirSync(`./${folder}`).filter(scripts => scripts.endsWith(".js"));

            for (const component of componentsScripts)
            {
                const componentScript = require(`../${folder}/${component}`);
                if (componentScript.name && componentScript) this.list.set(componentScript.name, componentScript);
            };
        });
    };
};

module.exports =
{
    name: "interactionCreate",
    scripts: new Scripts(),
    async run(client, db, interaction)
    {
        if (!interaction.guild) return;
        const guild = interaction.guild;

        let script = this.scripts.list.get(interaction.commandName);
        if (!script) script = this.scripts.list.get(interaction.customId);
        if (!script) return interaction.reply({ content: ":warning: Command or component not found!", flags: MessageFlags.Ephemeral });

        if (interaction.isAutocomplete() && script.autocomplete)
        {
            const input = interaction.options.getFocused();
            const filtered = script.autocomplete.filter(choice => choice.startsWith(input));

            await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
            return;
        };

        if (script.permission && !interaction.member.permissions.has(script.permission) && !interaction.member.permissions.has(Perms.Administrator) && interaction.user.id != interaction.guild.ownerId) return interaction.reply({ content: ":warning: You don't have the required permissions for this interaction.", flags: MessageFlags.Ephemeral });
        if (script.ownerOnly && interaction.user.id != guild.ownerId) return interaction.reply({ content: ":warning: This interaction is restricted to the server owner.", flags: MessageFlags.Ephemeral });

        console.log(`[debug] interactionCreate, ${script.name}, ${guild.id}, ${interaction.user.id}, ${Date.now()}`);
        await script.run(client, db, interaction);
    }
};