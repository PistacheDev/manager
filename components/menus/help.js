const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const discordPermissions = require('../../permissions.json');

module.exports =
{
    name: 'helpMenu',
    async run(client, db, interaction)
    {
        try
        {
            switch (interaction.values.toString())
            {
                case 'home':
                    homePage();
                    break;

                case 'close':
                    interaction.message.delete();
                    break;

                default: // Show commands by type. 
                    displayPage(interaction.values.toString());
                    break;
            };

            interaction.deferUpdate(); // To avoid an error.

            // Render the home page.
            function homePage()
            {
                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: 'Assistance menu', iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription('Quickly obtain the list of **commands by categories**! \nTo configure the application, run `/config`! \nYou can **navigate between the tabs** with the selective menu below. >>> To manage the application **more easily**, use the website! \nThe URL is **present** with the button **below**.')
                .setTimestamp()
                .setFooter({ text: `Executed by @${interaction.user.username}`, iconURL: interaction.user.avatarURL() })

                interaction.message.edit({ embeds: [embed] });
            };

            // Render the commands page.
            async function displayPage(type)
            {
                const commandsScripts = fs.readdirSync('./commands').filter(scripts => scripts.endsWith('.js'));

                let embed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: 'Assistance menu', iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: `Executed by @${interaction.user.username}`, iconURL: interaction.user.avatarURL() })

                for (const script of commandsScripts)
                {
                    const command = require(`../../commands/${script}`);
                    if (command.type != type) continue;

                    if (!command.data.options.length)
                    {
                        embed.addFields([{ name: `/${command.name}`, value: `**Description**: ${command.data.description}\n**Required permission**: ${command.ownerOnly ? 'Owner only' : command.permission ? discordPermissions[command.permission] : 'None'}.` }])
                        continue;
                    }
                    else
                    {
                        for (var i = 0; i < command.data.options.length; i++)
                        {
                            if (!command.data.options[i].type) embed.addFields([{ name: `/${command.name} ${command.data.options[i].name}`, value: `**Description**: ${command.data.options[i].description}\n**Required permission**: ${command.ownerOnly ? 'Owner only' : command.permission ? discordPermissions[command.permission] : 'None'}.` }])
                        };
                    };
                };

                await interaction.message.edit({ embeds: [embed] });
            };
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] helpMenu, ${err}, ${Date.now()}`);
        };
    }
};