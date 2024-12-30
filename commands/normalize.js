const { PermissionsBitField, SlashCommandBuilder } = require("discord.js");
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
            const target = guild.members.cache.get(interaction.options.getUser("user").id);
            const me = guild.members.cache.get(client.user.id);
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(":warning: You **can't normalize** this member because he's **higher in the role hierachy** than you or has the same role!" );
            if (me.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(":warning: I **can't normalize** this member because he's **higher in the role hierachy** than me or has the same role!")

            const current = target.displayName;
            const normalized = normalizer(current);

            if (current != normalized)
            {
                await target.setNickname(normalized);
                interaction.reply(`:white_check_mark: Pseudo normalized: **${current}** ➜ **${normalized}**.`)
            }
            else interaction.reply(":warning: This pseudo is **already normal**!");
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] normalize, ${err}, ${Date.now()}`);
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
        )
        .setDefaultMemberPermissions(this.permission)
    }
};