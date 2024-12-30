const { fixMissingConfig } = require("../../functions/missingConfig");
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");

module.exports =
{
    name: "autoraidmodeButton",
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
                if (config.length < 1) data = await fixMissingConfig(guild);

                if (data[0].autoraidmode == 0)
                {
                    const modal = new ModalBuilder()
                    .setCustomId("autoraidmodeModal")
                    .setTitle("Setup the auto raidmode:")

                    const modalOption = new TextInputBuilder()
                    .setCustomId("autoraidmodeModalOption")
                    .setLabel("Maximum members:")
                    .setPlaceholder("Maximum of new members during the interval (3 ~ 10).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput = new ActionRowBuilder()
                    .addComponents(modalOption)

                    const modalOption2 = new TextInputBuilder()
                    .setCustomId("autoraidmodeModalOption2")
                    .setLabel("Interval:")
                    .setPlaceholder("Interval of time in second (3 ~ 10).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput2 = new ActionRowBuilder()
                    .addComponents(modalOption2)

                    modal.addComponents(modalInput, modalInput2);
                    await interaction.showModal(modal);
                }
                else
                {
                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":closed_lock_with_key:・Raidmode:", value: `>>> **Status**: ${data[0].raidmode == 1 ? ":white_check_mark: Active" : ":x: Inactive"}.\n**Function**: Blocks the arrival of **new members**.` }])
                    .addFields([{ name: ":crossed_swords:・Auto raidmode:", value: `>>> **Status**: :x: Inactive.\n**Function**: Enable the **raidmode** when **too many users** join the server in a **short period** of time.` }])
                    .addFields([{ name: ":robot:・Anti bots:", value: `>>> **Status**: ${data[0].antibots == 1 ? ":white_check_mark: Active" : ":x: Inactive"}.\n**Function**: Blocks the **addition of applications**.` }])
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    db.query("UPDATE config SET autoraidmode = ? WHERE guild = ?", [0, guild.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.message.edit({ embeds: [embed] });
                        interaction.deferUpdate();
                    });
                };
            }); 
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] autoraidmodeButton, ${err}, ${Date.now()}`);
        };
    }
};