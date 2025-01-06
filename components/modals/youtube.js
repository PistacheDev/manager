const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "youtubeModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            var newChannel = interaction.fields.getTextInputValue("option");
            if (newChannel && !guild.channels.cache.get(newChannel)) return interaction.reply({ content: ":warning: This channel doesn't exist or the application can't access it!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);
                const twitch = data[0].twitch;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":video_camera:・YouTube Notifications:", value: `➜ ${!newChannel ? ":red_circle:" : ":yellow_circle:"} **Sends a message** in ${!newChannel ? "the **configured channel**" : `<#${newChannel}>`} mentioning ${!newChannel ? "the **configured role**" : "the **future role** (setup to complete)"} when ${!newChannel ? "the **configured YouTube channel**" : `the **future YouTube channel**`} releases a **new video**.` }])
                .addFields([{ name: ":television:・Twitch Notifications:", value: `➜ ${twitch == 0 ? ":red_circle:" : twitch.split(" ")[1] == 0 ? ":yellow_circle:" : ":green_circle:"} **Sends a message** in ${twitch == 0 ? "the **configured channel**" : `<#${twitch.split(" ")[0]}>`} mentioning ${twitch == 0 ? "the **configured role**" : twitch.split(" ")[1] == 0 ? "the **future role** (setup to complete)" : twitch.split(" ")[1] == "@everyone" ? "@everyone" : `<@&${twitch.split(" ")[1]}>`} when ${twitch == 0 ? "the **configured Twitch channel**" : twitch.split(" ")[1] == 0 ? "the **future Twitch channel**" : `**${twitch.split(" ")[2]}**`} goes to **live**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query("UPDATE config SET youtube = ? WHERE guild = ?", [!newChannel ? 0 : `${newChannel} 0 0 0 0`, guild.id], async (err) =>
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