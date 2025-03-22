const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function bansdefButtons(previousDisabled, nextDisabled)
{
    return new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId("bansdefPreviousButton")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(previousDisabled)
    ).addComponents(
        new ButtonBuilder()
        .setCustomId("bansdefNextButton")
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
    bansdefButtons
};