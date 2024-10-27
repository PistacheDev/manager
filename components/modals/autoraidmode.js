const { EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'autoraidmodeModal',
    ownerOnly: true,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                if (err) throw err;

                // Modal options.
                const maxMembers = interaction.fields.getTextInputValue('autoraidmodeModalOption');
                const interval = interaction.fields.getTextInputValue('autoraidmodeModalOption2');

                // Some verifications.
                if (isNaN(maxMembers) || isNaN(interval)) return interaction.reply(':warning: PLeaser, enter a **number**!');
                if (maxMembers < 3 || maxMembers > 10) return interaction.reply(':warning: The maximum members must be **between 3 and 10**!');
                if (interval < 3 || interval > 10) return interaction.reply(':warning: The interval must be **between 1 and 10 seconds**');

                db.query('UPDATE config SET autoraidmode = ? WHERE guild = ?', [`${maxMembers} ${interval}`, guild.id], async () =>
                {
                    const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                    .addFields([{ name: ':closed_lock_with_key:・Raidmode:', value: `>>> **Status**: ${data[0].raidmode == 1 ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the arrival of **new members**.` }])
                    .addFields([{ name: ':crossed_swords:・Auto raidmode:', value: `>>> **Status**: :white_check_mark: Active.\n**Detection**: More than ${maxMembers} new members in ${interval} seconds.\n**Function**: Enable the **raidmode** when **too many users** join the server in a **short period** of time.` }])
                    .addFields([{ name: ':robot:・Anti bots:', value: `>>> **Status**: ${data[0].antibots == 1 ? ':white_check_mark: Active' : ':x: Inactive'}.\n**Function**: Blocks the **addition of applications**.` }])
                    .addFields([{ name: ':globe_with_meridians:・Anti links:', value: `>>> **Status**: ${data[0].antilinks == 0 ? ':x: Inactive' : data[0].antilinks == 1 ? ':white_check_mark: Active' : ':lock: Enforced (bots too)'}.\n**Function**: Delete messages **containing links**.` }])
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    await interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] joinRoleModal, ${err}, ${Date.now()}`);
        };
    }
};