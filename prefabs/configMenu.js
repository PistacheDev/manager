const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

function configMenu()
{
    return new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
        .setCustomId("configMenu")
        .setPlaceholder("Select a tab.")
        .setOptions([
            { emoji: "🏡", label: "Home", description: "Return to home.", value: "home" },
            { emoji: "🛡️", label: "Security", description: "Configure security options.", value: "security" },
            { emoji: "🔨", label: "Moderation", description: "Configure moderation options.", value: "moderation" },
            { emoji: "📊", label: "XP", description: "Configure the XP system.", value: "XP" },
            { emoji: "🖇️", label: "Connections", description: "Configure external connections.", value: "API" },
            { emoji: "🛬", label: "Members", description: "Configure arrivals/departures.", value: "members" },
            { emoji: "📁", label: "Logs", description: "Configure logs.", value: "logs" },
            { emoji: "❌", label: "Close", description: "Close the configuration panel.", value: "close" }
        ])
    );
};

module.exports =
{
    configMenu
};