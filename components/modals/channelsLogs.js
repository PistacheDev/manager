const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "channelsLogsModal",
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

                const messagesLogs = data[0].messagesLogs;
                const bansLogs = data[0].bansLogs;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":speech_balloon:・Messages Logs:", value: `➜ ${messagesLogs == 0 ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${messagesLogs == 0 ? "the **configured channel**" : `<#${messagesLogs}>`} when a message is **deleted** or **edited**.` }])
                .addFields([{ name: ":keyboard:・Channels Logs:", value: `➜ ${!newChannel ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${!newChannel ? "the **configured channel**" : `<#${newChannel}>`} when a channel is **created**, **deleted**, or **edited**.` }])
                .addFields([{ name: ":scales:・Bans Logs:", value: `➜ ${bansLogs == 0 ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${bansLogs == 0 ? "the **configured channel**" : `<#${bansLogs}>`} when a ban is **issued** or **revoked**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });

                db.query("UPDATE config SET channelsLogs = ? WHERE guild = ?", [newChannel ? newChannel : 0, guild.id], async (err) =>
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