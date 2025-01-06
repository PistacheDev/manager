const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "messagesLogsModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            const newChannel = interaction.fields.getTextInputValue("option");
            if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply({ content: ":warning: This channel doesn't exist or the application can't access it!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);
                if ((newChannel && data[0].messagesLogs == newChannel) || (!newChannel && data[0].messagesLogs == 0)) return interaction.deferUpdate(); // The value didn't change.

                const channelsLogs = data[0].channelsLogs;
                const bansLogs = data[0].bansLogs;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":speech_balloon:・Messages Logs:", value: `➜ ${!newChannel ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${!newChannel ? "the **configured channel**" : `<#${newChannel}>`} when a message is **deleted** or **edited**.` }])
                .addFields([{ name: ":keyboard:・Channels Logs:", value: `➜ ${channelsLogs == 0 ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${channelsLogs == 0 ? "the **configured channel**" : `<#${channelsLogs}>`} when a channel is **created**, **deleted**, or **edited**.` }])
                .addFields([{ name: ":scales:・Bans Logs:", value: `➜ ${bansLogs == 0 ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${bansLogs == 0 ? "the **configured channel**" : `<#${bansLogs}>`} when a ban is **issued** or **revoked**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query("UPDATE config SET messagesLogs = ? WHERE guild = ?", [newChannel ? newChannel : 0, guild.id], async (err) =>
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