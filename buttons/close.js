const { PermissionsBitField } = require("discord.js");

module.exports =
{
    name: "closeButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        interaction.message.delete();
    }
};