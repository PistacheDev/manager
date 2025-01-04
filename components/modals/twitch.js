const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "twitchModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            var newChannel = interaction.fields.getTextInputValue("option");
            if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply(":warning: This channel doesn't exist or the application can't access it!");

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);
                const yt = data[0].youtube;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":video_camera:・YouTube Notifications:", value: `➜ ${yt == 0 ? ":red_circle:" : yt.split(" ")[1] == 0 ? ":yellow_circle:" : ":green_circle:"} **Sends a message** in ${yt == 0 ? "the **configured channel**" : `<#${yt.split(" ")[0]}>`} mentioning ${yt == 0 ? "the **configured role**" : yt.split(" ")[1] == 0 ? "the **future role** (setup to complete)" : yt.split(" ")[1] == "@everyone" ? "@everyone" : `<@&${yt.split(" ")[1]}>`} when ${yt == 0 ? "the **configured YouTube channel**" : yt.split(" ")[1] == 0 ? "the **future YouTube channel**" : `**${yt.split(" ")[2]}**`} releases a **new video**.` }])
                .addFields([{ name: ":television:・Twitch Notifications:", value: `➜ ${!newChannel ? ":red_circle:" : ":yellow_circle:"} **Sends a message** in ${!newChannel ? "the **configured channel**" : `<#${newChannel}>`} mentioning ${!newChannel ? "the **configured role**" : "the **future role** (setup to complete)"} when ${!newChannel ? "the **configured Twitch channel**" : "the **future Twitch channel**"} goes to **live**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });

                db.query("UPDATE config SET twitch = ? WHERE guild = ?", [!newChannel ? 0 : `${newChannel} 0 0 0 0`, guild.id], async (err) =>
                {
                    if (err) throw err
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