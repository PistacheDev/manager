const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "roles",
    type: "management",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            switch (interaction.options.getSubcommand())
            {
                case "add":
                    addRole();
                    break;
                default:
                    interaction.reply({ content: ":warning: Command not found!", flags: MessageFlags.Ephemeral});
					break;
            };

            // Add role to a type of members.
            function addRole()
            {
                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Give a specific role to everyone!", iconURL: client.user.avatarURL() })
                .setThumbnail(interaction.guild.iconURL())
                .setDescription(":dart:・__**Target a specific type of members:**__\n:bust_in_silhouette: ➜ Attribute the specific role to **humans ONLY**.\n:robot: ➜ Attribute the specific role to **bots ONLY**.\n:busts_in_silhouette: ➜ Attribute the specific role to **everyone**.")

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("roleAddHumansButton")
                    .setEmoji("👤")
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("roleAddBotsButton")
                    .setEmoji("🤖")
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("roleAddEveryoneButton")
                    .setEmoji("👥")
                    .setStyle(ButtonStyle.Primary)
                )

                interaction.reply({ embeds: [embed], components: [buttons], flags: MessageFlags.Ephemeral });
            };
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
		.setDescription("Roles dedicated commands.")
		.addSubcommand(
			cmd => cmd
			.setName("add")
			.setDescription("Add a specific role for eveyone.")
		).setDefaultMemberPermissions(this.permission)
    }
};