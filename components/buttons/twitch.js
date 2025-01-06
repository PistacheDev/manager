const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "twitchButton",
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

                if (data[0].twitch == 0) return showFirstModal(); // The option is turned off for this server, so the user can't disable it.
                const [channelID, roleID, twitchID, isLive, check] = data[0].twitch.split(" ");

                if (roleID == 0 || twitchID == 0) showSecondModal(); // The configuration isn't finished, so the user isn't allowed to disable it for now.
                else showFirstModal(); // The option is turned on, so the user is now allowed to disable it.

                async function showFirstModal()
                {
                    const modal = new ModalBuilder()
                    .setCustomId("twitchModal")
                    .setTitle("Setup the notifications:")

                    const option = new TextInputBuilder()
                    .setCustomId("option")
                    .setLabel("Where I have to send the notifs? (Channel ID)")
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
                    .setCustomId("twitchSetupModal")
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
                    .setLabel("What's the targeted Twitch channel?")
                    .setPlaceholder("Enter the channel URL (https://twitch.tv/example).")
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