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
                .addFields([{ name: ':closed_lock_with_key:・Raidmode:', value: `>>> **Status**: ${data[0].raidmode == 'true' ? ':x: Inactive' : ':white_check_mark: Active'}.\n**Function**: Blocks the arrival of **new members**.` }])
                .addFields([{ name: ':robot:・Anti-bot:', value: `>>> **Status**: ${data[0].antibot == 'true' ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the **addition of applications**.` }])
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