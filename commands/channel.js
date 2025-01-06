const { PermissionsBitField, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
	name: "channel",
	type: "management",
	permission: PermissionsBitField.Flags.ManageChannels,
	async run(client, db, interaction)
	{
		try
		{
			var channel = interaction.options.getChannel("channel");
			if (!channel) channel = interaction.channel; // Select the current channel if nothing's specified.

			// Check what sub command has been executed.
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

			// Clone the channel.
			function clone()
			{
				channel.clone().then(async () =>
				{
					interaction.deferUpdate();
				});
			};

			// Clone and delete the original channel.
			function recreate()
			{
				channel.clone().then(newChannel =>
				{
					channel.delete();
					newChannel.send(`:repeat: Channel **recreated**!`);
					interaction.deferUpdate();
				});
			};
		}
		catch (err)
		{
            console.error(`[error] ${this.name} ${interaction.options.getSubcommand()}, ${err}, ${Date.now()}`);
		};
	},
	get data()
	{
		return new SlashCommandBuilder()
		.setName(this.name)
		.setDescription("Channel dedicated commands.")
		.addSubcommand(
			cmd => cmd
			.setName("clone")
			.setDescription("Clone a channel.")
			.addChannelOption(
				opt => opt
				.setName("channel")
				.setDescription("Channel to clone.")
			)
		).addSubcommand(
			cmd => cmd
			.setName("recreate")
			.setDescription("Recreate a channel.")
			.addChannelOption(
				opt => opt
				.setName("channel")
				.setDescription("Channel to recreate.")
			)
		).setDefaultMemberPermissions(this.permission)
	}
};