const { PermissionsBitField, EmbedBuilder, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");
const axios = require("axios");

module.exports =
{
    name: "twitchSetupModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const roleID = interaction.fields.getTextInputValue("option1");
            const channelURL = interaction.fields.getTextInputValue("option2");
            const guild = interaction.guild;
            if (roleID != "@everyone" && !guild.roles.cache.get(roleID)) return interaction.reply({ content: ":warning: This role doesn't exist!", flags: MessageFlags.Ephemeral });

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                try
                {
                    await axios.get(channelURL);
                }
                catch (err)
                {
                    interaction.reply({ content: ":warning: This Twitch channel doesn't exist!", flags: MessageFlags.Ephemeral });
                    console.error(`[error] ${this.name}, request, ${err}, ${Date.now()}`);
                    return;
                };

                const channelID = data[0].twitch.split(" ")[0];
                const twitchID = channelURL.split("twitch.tv/")[1];
                const yt = data[0].youtube;

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":video_camera:・YouTube Notifications:", value: `➜ ${yt == 0 ? ":red_circle:" : yt.split(" ")[1] == 0 ? ":yellow_circle:" : ":green_circle:"} **Sends a message** in ${yt == 0 ? "the **configured channel**" : `<#${yt.split(" ")[0]}>`} mentioning ${yt == 0 ? "the **configured role**" : yt.split(" ")[1] == 0 ? "the **future role** (setup to complete)" : yt.split(" ")[1] == "@everyone" ? "@everyone" : `<@&${yt.split(" ")[1]}>`} when ${yt == 0 ? "the **configured YouTube channel**" : yt.split(" ")[1] == 0 ? "the **future YouTube channel**" : `**${yt.split(" ")[2]}**`} releases a **new video**.` }])
                .addFields([{ name: ":television:・Twitch Notifications:", value: `➜ :green_circle: **Sends a message** in <#${channelID}> mentioning ${roleID == "@everyone" ? "@everyone" : `<@&${roleID}>`} when **${twitchID}** goes to **live**.` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                interaction.message.edit({ embeds: [embed] });
                interaction.deferUpdate();

                db.query("UPDATE config SET twitch = ? WHERE guild = ?", [`${channelID} ${roleID} ${twitchID} 0 0`, guild.id], async (err) =>
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