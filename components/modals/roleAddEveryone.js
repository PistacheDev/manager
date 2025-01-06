const { PermissionsBitField, MessageFlags } = require("discord.js");

module.exports =
{
    name: "roleAddEveryoneModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            const role = interaction.fields.getTextInputValue("option");
            if (!guild.roles.cache.get(role)) return interaction.reply({ content: ":warning: This role doesn't exist!", flags: MessageFlags.Ephemeral });

            interaction.message.delete();
            interaction.deferUpdate();
            const members = await guild.members.fetch();

            members.forEach(member =>
            {
                member.roles.add(role).catch(() => {});
            });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};