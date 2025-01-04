const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const config = require("../json/config.json");

module.exports =
{
    name: "guildCreate",
    async run(client, db, guild)
    {
        try
        {
            var buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setURL("https://github.com/PistacheDev/manager")
                .setLabel("GitHub")
                .setStyle(ButtonStyle.Link)
            )
            .addComponents(
                new ButtonBuilder()
                .setURL("https://discord.com/invite/RkB3ZQsmGV")
                .setLabel("Discord")
                .setStyle(ButtonStyle.Link)
            )

            const embed = new EmbedBuilder()
            .setColor("Gold")
            .setAuthor({ name: `Thank you for choosing ${client.user.username} for your server ${guild.name}!`, iconURL: client.user.avatarURL() })
            .setDescription(":information_source: __**Recommendations and Features.**__")
            .setThumbnail(guild.iconURL())
            .addFields([{ name: "I - Cybersecurity", value: "For cybersecurity reasons, please place the application role only above the necessary roles." }])
            .addFields([{ name: "II - Open Source", value: "This application is fully Open Source! You can contribute to it or read the code if you wish, directly on GitHub." }])
            .addFields([{ name: "III - Development", value: "The application is under development, so you may encounter bugs or malfunctions. To report them, we have a community Discord server." }])
            .setTimestamp()
            .setFooter({ text: `Manager v${config.version}.` })

            db.query("INSERT INTO config (`guild`) VALUES (?)", [guild.id], async (err) =>
            {
                if (err) throw err;
                const owner = await guild.fetchOwner();
                const dm = await owner.createDM({ force: true }); // Force the creation of the DM channel.
                await dm.send({ embeds: [embed], components: [buttons] }); // Send the DM to the owner.
            });
        }
        catch(err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};