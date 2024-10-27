const { EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'antilinksButton',
    ownerOnly: true,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');

                const embed = new EmbedBuilder()
                .setColor('Gold')
                .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                .addFields([{ name: ':closed_lock_with_key:・Raidmode:', value: `>>> **Status**: ${data[0].raidmode == 1 ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the arrival of **new members**.` }])
                .addFields([{ name: ':robot:・Anti bots:', value: `>>> **Status**: ${data[0].antibots == 1 ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the **addition of applications**.` }])
                .addFields([{ name: ':globe_with_meridians:・Anti links:', value: `>>> **Status**: ${data[0].antilinks == 0 ? ':white_check_mark: Active' : data[0].antilinks == 1 ? ':lock: Enforced (bots too)' : ':x: Inactive'}.\n**Function**: Delete messages **containing links**.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                db.query('UPDATE config SET antilinks = ? WHERE guild = ?', [data[0].antilinks == 0 ? 1 : data[0].antilinks == 1 ? 2 : 0, guild.id], async () =>
                {
                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] antilinksButton, ${err}, ${Date.now()}`);
        };
    }
};