const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "xpSettingsButton",
    permission: PermissionsBitField.Flags.Administrator,
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

                if (data[0].xp == 0)
                {
                    const modal = new ModalBuilder()
                    .setCustomId("xpSettingsModal")
                    .setTitle("Setup the XP settings:")

                    const modalOption = new TextInputBuilder()
                    .setCustomId("xpSettingsModalOption")
                    .setLabel("Alert when level up:")
                    .setPlaceholder("Answer by \"yes\" or \"no\".")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput = new ActionRowBuilder()
                    .addComponents(modalOption)

                    const modalOption2 = new TextInputBuilder()
                    .setCustomId("xpSettingsModalOption2")
                    .setLabel("XP per message:")
                    .setPlaceholder("Enter the max amount of XP per message (1 ~ 50).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput2 = new ActionRowBuilder()
                    .addComponents(modalOption2)

                    const modalOption3 = new TextInputBuilder()
                    .setCustomId("xpSettingsModalOption3")
                    .setLabel("Maximum Level:")
                    .setPlaceholder("Enter the max level wanted (10 ~ 100).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput3 = new ActionRowBuilder()
                    .addComponents(modalOption3)

                    modal.addComponents(modalInput, modalInput2, modalInput3);
                    await interaction.showModal(modal);
                }
                else
                {
                    let goals = "";

                    for (let i = 0; i < 4; i++) // Fetch and load every goals.
                    {
                        const goal = data[0].xpgoals.split(" ")[i];
                        if (goal != 0) goals = `${goals}**Goal ${i + 1}/4**: Level ${goal.split("-")[0]} ➜ <@&${goal.split("-")[1]}>.${i < 3 ? "\n" : ""}`;
                        else goals = `${goals}**Goal ${i + 1}/4**: Not configured.${i < 3 ? "\n" : ""}`;
                    };

                    const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                    .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
                    .addFields([{ name: ":gear:・XP system:", value: `>>> **Status**: :x: Inactive.\n**Function**: Set the **application behavior** in the XP system.` }])
                    .addFields([{ name: ":trophy:・Goals:", value: `>>> ${goals}\n**Function**: When a member **reach a certain level**, the application **give a role**.` }]) 
                    .setThumbnail(client.user.avatarURL())
                    .setTimestamp()
                    .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                    db.query("UPDATE config SET xp = ? WHERE guild = ?", [0, guild.id], async (err) =>
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
            console.error(`[error] bansLogsButton, ${err}, ${Date.now()}`);
        };
    }
};