const { EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'raidmodeButton',
    ownerOnly: true,
    async run(client, db, interaction)
    {
        try
        {
            db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
            {
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');

                const embed = new EmbedBuilder()
                .setColor('Gold')
                .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                .addFields([{ name: ':hand_splayed:・Anti spam:', value: `>>> **Status**: ${statut}.\n**Function**: Prevent the members from **spamming messages**.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

                // Update the data in the database.
                db.query('UPDATE config SET raidmode = ? WHERE guild = ?', [data[0].raidmode == 'true' ? 'false' : 'true', interaction.guild.id], async () =>
                {
                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate(); // To avoid an error.
                });
            }); 
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] raidmodeButton, ${err}, ${Date.now()}`);
        };
    }
};