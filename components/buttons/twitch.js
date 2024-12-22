const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports =
{
    name: "twitchButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            db.query("SELECT * FROM config WHERE guild = ?", [interaction.guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data[0].twitch == 0) return showFirstModal(); // The option is turned off for this server, so the user can't disable it.
                const [channelID, roleID, twitchID, isLive] = data[0].twitch.split(" ");

                if (roleID == 0 || twitchID == 0) showSecondModal(); // The configuration isn't finished, so the user isn't allowed to disable it for now.
                else showFirstModal(); // The option is turned on, so the user is now allowed to disable it.

                async function showFirstModal()
                {
                    const modal = new ModalBuilder()
                    .setCustomId("twitchModal")
                    .setTitle("Setup the notifications:")

                    const modalOption = new TextInputBuilder()
                    .setCustomId("twitchModalOption")
                    .setLabel("Channel ID:")
                    .setPlaceholder("To disable this option, let this field empty.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                    const modalInput = new ActionRowBuilder()
                    .addComponents(modalOption)

                    modal.addComponents(modalInput);
                    await interaction.showModal(modal);
                };

                async function showSecondModal()
                {
                    const modal = new ModalBuilder()
                    .setCustomId("twitchSetupModal")
                    .setTitle("Setup the notifications:")

                    const modalOption = new TextInputBuilder()
                    .setCustomId("twitchModalOption")
                    .setLabel("Role ID:")
                    .setPlaceholder("Enter a role ID or @everyone.")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput = new ActionRowBuilder()
                    .addComponents(modalOption);

                    const modalOption2 = new TextInputBuilder()
                    .setCustomId("twitchModalOption2")
                    .setLabel("Twitch channel:")
                    .setPlaceholder("Enter the channel URL (https://twitch.tv/example).")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                    const modalInput2 = new ActionRowBuilder()
                    .addComponents(modalOption2)

                    modal.addComponents(modalInput, modalInput2);
                    await interaction.showModal(modal);
                };
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] twitchButton, ${err}, ${Date.now()}`);
        };
    }
};