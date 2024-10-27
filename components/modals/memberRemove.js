const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'memberRemoveModal',
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, data) =>
            {
                // Modal option.
                var newChannel = interaction.fields.getTextInputValue('memberRemoveModalOption');

                // Some verifications.
                if (data.length < 1) return interaction.reply(':warning: Your server isn\'t registered in the database!\n:grey_question: To fix this issue, run the \`/repair\` command.');
                if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply(':warning: This channel doesn\'t exist or the application can\'t access it!');

                db.query('UPDATE config SET memberRemove = ? WHERE guild = ?', [newChannel ? newChannel : 0, guild.id], async () =>
                {
                    const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                    .setThumbnail(client.user.avatarURL())
                    .setDescription('Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n>>> __**Now, you can also configure the application with the online dashboard**__ available on the official website of the application (*link provided below*).')
                    .addFields([{ name: ':airplane_arriving:・Arrival Messages:', value: `>>> **Status**: ${data[0].memberAdd == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${data[0].memberAdd}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **joins the server**.` }])
                    .addFields([{ name: ':envelope_with_arrow:・Arrival Role:', value: `>>> **Status**: ${data[0].joinRole == 0 ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Role**: <@&${data[0].joinRole}>`}.\n**Function**: **Assigns a role** to a user when they **join the server**.` }])
                    .addFields([{ name: ':airplane_departure:・Departure Messages:', value: `>>> **Status**: ${!newChannel ? ':x: Inactive' : `:white_check_mark: Active.\n**Configured Channel**: <#${newChannel}>`}.\n**Function**: **Sends a message** in the **configured channel** when a user **leaves the server**.` }])
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
            console.error(`[error] memberRemoveModal, ${err}, ${Date.now()}`);
        };
    }
};