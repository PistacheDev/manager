const { PermissionsBitField, SlashCommandBuilder, MessageFlags } = require("discord.js");
const normalizer = require("replace-special-characters");

module.exports =
{
    name: "normalize",
    type: "management",
    permission: PermissionsBitField.Flags.ManageNicknames,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            const target = guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.
            const me = guild.members.cache.get(client.user.id); // Fetch ourself in the server list.

            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: You can't normalize this member because he's higher than you in the role hierachy or at the same level!", flags: MessageFlags.Ephemeral });
            if (me.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: I can't normalize this member because he's higher than me in the role hierachy or at the same level!", flags: MessageFlags.Ephemeral })

            const current = target.displayName;
            const normalized = normalizer(current); // Normalize the pseudo.

            if (current != normalized)
            {
                await target.setNickname(normalized); // Change the target's nickname.
                interaction.reply({ content: `:white_check_mark: **${current}** ➜ **${normalized}**.`, flags: MessageFlags.Ephemeral })
            }
            else interaction.reply({ content: ":warning: This pseudo can't be normalized!", flags: MessageFlags.Ephemeral});
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Normalize the pseudo of a user.")
        .addUserOption(
            opt => opt
            .setName("user")
            .setDescription("User to normalize.")
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};