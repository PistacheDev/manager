const { EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'raidmodeButton',
    ownerOnly: true,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');
                let status = ':x: Inactive';

                if (data[0].autoraidmode != 0)
                {
                    const [maxMembers, interval] = data[0].autoraidmode.split(' ');
                    status = `:white_check_mark: Active.\n**Detection**: More than ${maxMembers} new members in ${interval} seconds`;
                };

                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                .addFields([{ name: ':closed_lock_with_key:・Raidmode:', value: `>>> **Status**: ${data[0].raidmode == 1 ? ':x: Inactive' : ':white_check_mark: Active'}.\n**Function**: Blocks the arrival of **new members**.` }])
                .addFields([{ name: ':crossed_swords:・Auto raidmode:', value: `>>> **Status**: ${status}.\n**Function**: Enable the **raidmode** when **too many users** join the server in a **short period** of time.` }])
                .addFields([{ name: ':robot:・Anti bots:', value: `>>> **Status**: ${data[0].antibots == 1 ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the **addition of applications**.` }])
                .addFields([{ name: ':globe_with_meridians:・Anti links:', value: `>>> **Status**: ${data[0].antilinks == 0 ? ':x: Inactive' : data[0].antilinks == 1 ? ':white_check_mark: Active' : ':lock: Enforced (bots too)'}.\n**Function**: Delete messages **containing links**.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() });

                db.query('UPDATE config SET raidmode = ? WHERE guild = ?', [data[0].raidmode == 1 ? 0 : 1, guild.id], async () =>
                {
                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
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