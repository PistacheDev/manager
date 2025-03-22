const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function warnsButtons(previousDisabled, nextDisabled)
{
    return new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId("warnsPreviousButton")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(previousDisabled)
    ).addComponents(
        new ButtonBuilder()
        .setCustomId("warnsNextButton")
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(nextDisabled)
    ).addComponents(
        new ButtonBuilder()
        .setCustomId("closeButton")
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger)
    );
};

module.exports =
{
    warnsButtons
};