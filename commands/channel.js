const { PermissionsBitField, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
	name: "channel",
	type: "management",
	permission: PermissionsBitField.Flags.ManageChannels,
	async run(client, db, interaction)
	{
		var channel = interaction.options.getChannel("channel");

		if (!channel) channel = interaction.channel;
		if (!channel.manageable) return interaction.reply({ content: ":warning: I can't manage this channel!", flags: MessageFlags.Ephemeral });

		switch (interaction.options.getSubcommand())
		{
			case "clone":
				clone();
				break;
			case "recreate":
				recreate();
				break;
			default:
				interaction.reply({ content: ":warning: Command not found!", flags: MessageFlags.Ephemeral });
				break;
		};

		function clone()
		{
			channel.clone().then(async () =>
			{
				interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });
			});
		};

		function recreate()
		{
			channel.clone().then(newChannel =>
			{
				channel.delete();
				newChannel.send(`:repeat: Channel **recreated**!`);
				if (channel.id != newChannel.id) interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });
			});
		};
	},
	get data()
	{
		return new SlashCommandBuilder()
		.setName(this.name)
		.setDescription("Channel dedicated commands.")
		.addSubcommand(cmd => cmd
			.setName("clone")
			.setDescription("Clone a channel.")
			.addChannelOption(opt => opt
				.setName("channel")
				.setDescription("Channel to clone.")
			)
		).addSubcommand(cmd => cmd
			.setName("recreate")
			.setDescription("Recreate a channel.")
			.addChannelOption(opt => opt
				.setName("channel")
				.setDescription("Channel to recreate.")
			)
		).setDefaultMemberPermissions(this.permission)
	}
};