const { PermissionsBitField, SlashCommandBuilder, MessageFlags } = require("discord.js");
const normalizer = require("replace-special-characters");

module.exports =
{
    name: "normalize",
    type: "management",
    permission: PermissionsBitField.Flags.ManageNicknames,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        const mod = interaction.member;

        const target = guild.members.cache.get(interaction.options.getUser("user").id);
        const me = guild.members.cache.get(client.user.id);

        if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: You don't have the permission to normalize this member!", flags: MessageFlags.Ephemeral });
        if (me.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: I don't have the permission to normalize this member!", flags: MessageFlags.Ephemeral })

        const current = target.displayName;
        const normalized = normalizer(current);

        if (current != normalized)
        {
            console.log(`[${this.name}] ${guild.id}, ${mod.id}, ${target.id}, ${current}, ${normalized}, ${Date.now()}`);
            await target.setNickname(normalized);
            interaction.reply({ content: `:white_check_mark: **${current}** ➜ **${normalized}**`, flags: MessageFlags.Ephemeral });
        }
        else interaction.reply({ content: ":warning: This pseudo is already normal!", flags: MessageFlags.Ephemeral});
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Normalize the pseudo of a member.")
        .addUserOption(opt => opt
            .setName("user")
            .setDescription("User to normalize.")
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};