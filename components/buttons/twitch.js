const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "twitchButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query("SELECT * FROM config WHERE guild = ?", [interaction.guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                if (data[0].twitch == 0)
                {
                    const modal = new ModalBuilder()
                    .setCustomId("twitchModal")
                    .setTitle("Setup the notifications:")

                    const option = new TextInputBuilder()
                    .setCustomId("option")
                    .setLabel("Where I have to send the notifs? (Channel ID)")
                    .setPlaceholder("Enter the channel ID.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                    const input = new ActionRowBuilder()
                    .addComponents(option)

                    const option2 = new TextInputBuilder()
                    .setCustomId("option2")
                    .setLabel("What role will be mentioned?")
                    .setPlaceholder("Enter a role ID or @everyone.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input2 = new ActionRowBuilder()
                    .addComponents(option2);

                    const option3 = new TextInputBuilder()
                    .setCustomId("option3")
                    .setLabel("What's the targeted Twitch channel?")
                    .setPlaceholder("Channel URL (https://twitch.tv/example).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input3 = new ActionRowBuilder()
                    .addComponents(option3)

                    modal.addComponents(input, input2, input3);
                    await interaction.showModal(modal);
                }
                else
                {
                    const yt = data[0].youtube;

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .setThumbnail(client.user.avatarURL())
                    .addFields([{ name: ":video_camera:・YouTube Notifications:", value: `➜ ${yt == 0 ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${yt == 0 ? "the **configured channel**" : `<#${yt.split(" ")[0]}>`} mentioning ${yt == 0 ? "the **configured role**" : yt.split(" ")[1] == "@everyone" ? "@everyone" : `<@&${yt.split(" ")[1]}>`} when ${yt == 0 ? "the **configured YouTube channel**" : `**${await fetchYouTubeName(yt.split(" ")[2])}**`} releases a **new video**.` }])
                    .addFields([{ name: ":television:・Twitch Notifications:", value: `➜ :red_circle: **Sends a message** in the **configured channel** mentioning the **configured role** when the **configured Twitch channel** goes to **live**.` }])
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();

                    db.query("UPDATE config SET twitch = ? WHERE guild = ?", [0, guild.id], async (err) =>
                    {
                        if (err) throw err;
                    });
                };
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};