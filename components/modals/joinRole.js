const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'joinRoleModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            let embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
            .setThumbnail(client.user.avatarURL())
            .setDescription('Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n>>> __**Now, you can also configure the application with the online dashboard**__ available on the official website of the application (*link provided below*).')
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })

            db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
            {
                // Some verifications.
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');
                var newRole = interaction.fields.getTextInputValue('joinRoleModalOption');
                if (newRole && !interaction.guild.roles.cache.get(newRole)) return interaction.reply(':warning: This role doesn\'t exist!');

                db.query('UPDATE config SET joinRole = ? WHERE guild = ?', [!newRole ? null : newRole, interaction.guild.id], async () =>
                {
                    // Generate the fields.
                    embed.addFields([{ name: ':airplane_arriving:・Arrival Messages:', value: `>>> **Status**: ${data[0].memberAdd == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].memberAdd}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **joins the server**.` }])
                    embed.addFields([{ name: ':envelope_with_arrow:・Arrival Role:', value: `>>> **Status**: ${!newRole ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Role**: <@&${newRole}>`}.\n**Function**: **Assigns a role** to a user when they **join the server**.` }])
                    embed.addFields([{ name: ':airplane_departure:・Departure Messages:', value: `>>> **Status**: ${data[0].memberRemove == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].memberRemove}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **leaves the server**.` }])

                    await interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate(); // To avoid an error.
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