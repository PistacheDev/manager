const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'memberAddModal',
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
                var newChannel = interaction.fields.getTextInputValue('memberAddModalOption');
                if (newChannel && !interaction.guild.channels.cache.get(newChannel)) return interaction.reply(':warning: The channel doesn\'t exist or the application can\'t access it!');

                db.query('UPDATE config SET memberAdd = ? WHERE guild = ?', [!newChannel ? null : newChannel, interaction.guild.id], async () =>
                {
                    // Generate the fields.
                    embed.addFields([{ name: ':airplane_arriving:・Arrival Messages:', value: `>>> **Status**: ${!newChannel ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${newChannel}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **joins the server**.` }])
                    embed.addFields([{ name: ':envelope_with_arrow:・Arrival Role:', value: `>>> **Status**: ${data[0].joinRole == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Role**: <@&${data[0].joinRole}>`}.\n**Function**: **Assigns a role** to a user when they **join the server**.` }])
                    embed.addFields([{ name: ':airplane_departure:・Departure Messages:', value: `>>> **Status**: ${data[0].memberRemove == null ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].memberRemove}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **leaves the server**.` }])

                    await interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate(); // To avoid an error.
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] memberAddModal, ${err}, ${Date.now()}`);
        };
    }
};