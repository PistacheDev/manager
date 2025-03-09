const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "memberAddModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const newChannel = interaction.fields.getTextInputValue("option");
            const guild = interaction.guild;
            if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply({ content: ":warning: The channel doesn't exist or the application can't access it!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);
                if ((newChannel && data[0].memberAdd == newChannel) || (!newChannel && data[0].memberAdd == 0)) return interaction.deferUpdate(); // The value didn't change.

                const role = data[0].joinRole;
                const normalizer = data[0].autoNormalizer;
                const memberRemove = data[0].memberRemove;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":airplane_arriving:・Arrival Messages:", value: `➜ ${!newChannel ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${!newChannel ? "the **configured channel**" : `<#${newChannel}>`} when a user **joins the server**.` }])
                .addFields([{ name: ":envelope_with_arrow:・Arrival Role:", value: `➜ ${role == 0 ? ":red_circle:" : ":green_circle:"} **Assigns ${role == 0 ? "a role" : `<@&${role}>`}** to the new arrived users.` }])
                .addFields([{ name: ":label:・Auto Normalizer:", value: `➜ ${normalizer == 0 ? ":red_circle:" : ":green_circle:"} **Auto normalize the pseudo** of the members who **join the server** and the members who **modify their profile**.` }])
                .addFields([{ name: ":airplane_departure:・Departure Messages:", value: `➜ ${memberRemove == 0 ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${memberRemove == 0 ? "the **configured channel**" : `<#${memberRemove}>`} when a user **leaves the server**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query("UPDATE config SET memberAdd = ? WHERE guild = ?", [newChannel ? newChannel : 0, guild.id], async (err) =>
                {
                    if (err) throw err;
                });
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};