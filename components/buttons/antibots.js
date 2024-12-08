const { fixMissingConfig } = require("../../functions/missingConfig");
const { EmbedBuilder } = require("discord.js");

module.exports =
{
    name: "antibotButton",
    ownerOnly: true,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;

                if (config.length < 1) data = fixMissingConfig(guild);
                let status = ":x: Inactive";

                if (data[0].autoraidmode != 0)
                {
                    const [maxMembers, interval] = data[0].autoraidmode.split(" ");
                    status = `:white_check_mark: Active.\n**Detection**: More than ${maxMembers} new members in ${interval} seconds`;
                };

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                .addFields([{ name: ":closed_lock_with_key:・Raidmode:", value: `>>> **Status**: ${data[0].raidmode == 1 ? ":white_check_mark: Active" : ":x: Inactive"}.\n**Function**: Blocks the arrival of **new members**.` }])
                .addFields([{ name: ":crossed_swords:・Auto raidmode:", value: `>>> **Status**: ${status}.\n**Function**: Enable the **raidmode** when **too many users** join the server in a **short period** of time.` }])
                .addFields([{ name: ":robot:・Anti bots:", value: `>>> **Status**: ${data[0].antibots == 1 ? ":x: Inactive" : ":white_check_mark: Active"}.\n**Function**: Blocks the **addition of applications**.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                db.query("UPDATE config SET antibots = ? WHERE guild = ?", [data[0].antibots == 0 ? 1 : 0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] antibotButton, ${err}, ${Date.now()}`);
        };
    }
};