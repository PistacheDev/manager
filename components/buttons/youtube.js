const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "youtubeButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            db.query("SELECT * FROM config WHERE guild = ?", [interaction.guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                if (data[0].youtube == 0) return showFirstModal(); // The option is turned off for this server, so the user can't disable it.
                const [channelID, roleID, youtubeID, latestVideoID] = data[0].youtube.split(" ");

                if (roleID == 0 || youtubeID == 0) showSecondModal(); // The configuration isn't finished, so the user isn't allowed to disable it for now.
                else showFirstModal(); // The option is turned on, so the user is now allowed to disable it.

                async function showFirstModal()
                {
                    const modal = new ModalBuilder()
                    .setCustomId("youtubeModal")
                    .setTitle("Setup the notifications:")

                    const option = new TextInputBuilder()
                    .setCustomId("option")
                    .setLabel("Where I have to send the logs? (Channel ID)")
                    .setPlaceholder("To disable this option, let this field empty.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                    const input = new ActionRowBuilder()
                    .addComponents(option)

                    modal.addComponents(input);
                    await interaction.showModal(modal);
                };

                async function showSecondModal()
                {
                    const modal = new ModalBuilder()
                    .setCustomId("youtubeSetupModal")
                    .setTitle("Setup the notifications:")

                    const option1 = new TextInputBuilder()
                    .setCustomId("option1")
                    .setLabel("What role will be mentioned?")
                    .setPlaceholder("Enter a role ID or @everyone.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input1 = new ActionRowBuilder()
                    .addComponents(option1);

                    const option2 = new TextInputBuilder()
                    .setCustomId("option2")
                    .setLabel("What's the targeted YouTube channel?")
                    .setPlaceholder("Enter the channel URL (https://www.youtube.com/@example).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const input2 = new ActionRowBuilder()
                    .addComponents(option2)

                    modal.addComponents(input1, input2);
                    await interaction.showModal(modal);
                };
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};