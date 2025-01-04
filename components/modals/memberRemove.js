const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "memberRemoveModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            const newChannel = interaction.fields.getTextInputValue("option");
            if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply(":warning: This channel doesn't exist or the application can't access it!");

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                const memberAdd = data[0].memberAdd;
                const role = data[0].joinRole;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":airplane_arriving:・Arrival Messages:", value: `➜ ${memberAdd == 0 ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${memberAdd == 0 ? "the **configured channel**" : `<#${memberAdd}>`} when a user **joins the server**.` }])
                .addFields([{ name: ":envelope_with_arrow:・Arrival Role:", value: `➜ ${role == 0 ? ":red_circle:" : ":green_circle:"} **Assigns ${role == 0 ? "a role" : `<@&${role}>`}** to the new arrived users.` }])
                .addFields([{ name: ":airplane_departure:・Departure Messages:", value: `➜ ${!newChannel ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${!newChannel ? "the **configured channel**" : `<#${newChannel}>`} when a user **leaves the server**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });

                db.query("UPDATE config SET memberRemove = ? WHERE guild = ?", [newChannel ? newChannel : 0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};