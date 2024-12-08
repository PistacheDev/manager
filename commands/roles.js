const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require("discord.js");

module.exports =
{
    name: "roles",
    type: "management",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            switch (interaction.options.getSubcommand()) // Check what sub command has been executed.
            {
                case "add":
                    addRole();
                    break;
                default:
                    interaction.reply(":warning: Unknown **command**!");
					break;
            };

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

                interaction.reply({ embeds: [embed], components: [buttons] });
            };
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] roles, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
		.setName(this.name)
		.setDescription("Role dedicated commands.")
		.addSubcommand(
			cmd => cmd
			.setName("add")
			.setDescription("Add a specific role for eveyone.")
		).setDefaultMemberPermissions(this.permission)
    }
};