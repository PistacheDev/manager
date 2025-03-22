const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");

module.exports =
{
    name: "arrivalRoleModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        const newRole = interaction.fields.getTextInputValue("option");
        if (newRole && !guild.roles.cache.get(newRole)) return interaction.reply({ content: ":warning: This role doesn't exist!", flags: MessageFlags.Ephemeral });

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;

            if (config.length < 1) data = await fixMissingConfig(guild);
            if ((newRole && data[0].joinRole == newRole) || (!newRole && data[0].joinRole == 0)) return interaction.deferUpdate();

            const memberAdd = data[0].memberAdd;
            const normalizer = data[0].autoNormalizer;
            const memberRemove = data[0].memberRemove;

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
            .setThumbnail(client.user.avatarURL())
            .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
            .addFields([{ name: ":airplane_arriving:・Arrival Messages:", value: `➜ ${memberAdd == 0 ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${memberAdd == 0 ? "the **configured channel**" : `<#${memberAdd}>`} when a user **joins the server**.` }])
            .addFields([{ name: ":envelope_with_arrow:・Arrival Role:", value: `➜ ${!newRole ? ":red_circle:" : ":green_circle:"} **Assigns ${!newRole ? "a role" : `<@&${newRole}>`}** to the new arrived users.` }])
            .addFields([{ name: ":label:・Auto Normalizer:", value: `➜ ${normalizer == 0 ? ":red_circle:" : ":green_circle:"} **Auto normalize the pseudo** of the members who **join the server** and the members who **modify their profile**.` }])
            .addFields([{ name: ":airplane_departure:・Departure Messages:", value: `➜ ${memberRemove == 0 ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${memberRemove == 0 ? "the **configured channel**" : `<#${memberRemove}>`} when a user **leaves the server**.` }])
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            interaction.message.edit({ embeds: [embed] });
            interaction.deferUpdate();

            db.query("UPDATE config SET joinRole = ? WHERE guild = ?", [newRole ? newRole : 0, guild.id], async (err) =>
            {
                if (err) throw err;
            });
        });
    }
};