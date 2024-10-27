const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'joinRoleModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                // Modal option.
                var newRole = interaction.fields.getTextInputValue('joinRoleModalOption');

                // Some verifications.
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');
                if (newRole && !guild.roles.cache.get(newRole)) return interaction.reply(':warning: This role doesn\'t exist!');

                db.query('UPDATE config SET joinRole = ? WHERE guild = ?', [newRole ? newRole : 0, guild.id], async () =>
                {
                    const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                    .addFields([{ name: ':airplane_arriving:・Arrival Messages:', value: `>>> **Status**: ${data[0].memberAdd == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].memberAdd}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **joins the server**.` }])
                    .addFields([{ name: ':envelope_with_arrow:・Arrival Role:', value: `>>> **Status**: ${!newRole ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Role**: <@&${newRole}>`}.\n**Function**: **Assigns a role** to a user when they **join the server**.` }])
                    .addFields([{ name: ':airplane_departure:・Departure Messages:', value: `>>> **Status**: ${data[0].memberRemove == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].memberRemove}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **leaves the server**.` }])
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