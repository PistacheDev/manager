const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

function helpMenu()
{
    return new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
        .setCustomId("helpMenu")
        .setPlaceholder("Select a tab.")
        .setOptions([
            { emoji: "🏡", label: "Home", description: "Return to home.", value: "home" },
            { emoji: "👑", label: "Management", description: "Management commands.", value: "management" },
            { emoji: "👮", label: "Moderation", description: "Moderation commands.", value: "moderation" },
            { emoji: "🛠️", label: "Utilities", description: "Utilities commands.", value: "utility" },
            { emoji: "🕹️", label: "Games", description: "Game commands.", value: "gaming" },
            { emoji: "🤖", label: "Application", description: "Commands dedicated to the application.", value: "application" },
            { emoji: "❌", label: "Close", description: "Close the assistance menu.", value: "close" }
        ])
    );
};

module.exports =
{
    helpMenu
};