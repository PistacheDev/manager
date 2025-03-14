const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const discordPermissions = require("../../json/permissions.json");

module.exports =
{
    name: "helpMenu",
    async run(client, db, interaction)
    {
        try
        {
            switch (interaction.values.toString())
            {
                case "home":
                    homePage();
                    break;
                case "close":
                    interaction.message.delete();
                    break;
                default:
                    displayPage(interaction.values.toString());
                    break;
            };

            function homePage()
            {
                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Assistance menu", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Quickly obtain the list of **commands by categories**!\nTo configure the application, run `/config`!\nYou can **navigate between the tabs** with the selective menu below.\n\n>>> A **documentation** will be added to the **official website** to help the **users to use** the application, and to help **programmers** to easily **understand the code**.")
                .setTimestamp()
                .setFooter({ text: `Executed by @${interaction.user.username}`, iconURL: interaction.user.avatarURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();
            };

            async function displayPage(type)
            {
                const commandsScripts = fs.readdirSync("./commands").filter(scripts => scripts.endsWith(".js"));

                let embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Assistance menu", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: `Executed by @${interaction.user.username}`, iconURL: interaction.user.avatarURL() })

                for (const script of commandsScripts)
                {
                    const command = require(`../../commands/${script}`);
                    if (command.type != type) continue;

                    if (!command.data.options[0] || command.data.options[0].type) // Commands doesn't have any ptions with a type.
                    {
                        embed.addFields([{ name: `/${command.name}`, value: `**Description**: ${command.data.description}\n**Required permission**: ${command.ownerOnly ? "Owner only" : command.permission ? discordPermissions[command.permission] : "None"}.` }])
                        continue;
                    }
                    else
                    {
                        for (let i = 0; i < command.data.options.length; i++)
                        {
                            // Avoid to take the sub commands options.
                            if (!command.data.options[i].type) embed.addFields([{ name: `/${command.name} ${command.data.options[i].name}`, value: `**Description**: ${command.data.options[i].description}\n**Required permission**: ${command.ownerOnly ? "Owner only" : command.permission ? discordPermissions[command.permission] : "None"}.` }])
                        };
                    };
                };

                await interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();
            };
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};