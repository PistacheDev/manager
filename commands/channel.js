const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports =
{
	name: 'channel',
	type: 'management',
	permission: PermissionsBitField.Flags.ManageChannels,
	async run(client, db, interaction)
	{
		try
		{
			var channel = interaction.options.getChannel('channel');
			if (!channel) channel = interaction.channel; // Select the current channel if nothing is specified.

			// Check what subcommand has been executed.
			switch (interaction.options.getSubcommand())
			{
				case 'clone':
					cloneChannel();
					break;

				case 'recreate':
					recreateChannel();
					break;

				default:
					interaction.reply(':warning: Unknown **command**!');
					break;
			};

			// Clone channel script.
			function cloneChannel()
			{
				channel.clone().then(async () =>
				{
					await interaction.reply(`:white_check_mark: <#${channel.id}> has been **cloned** successfully!`);
				});
			};

			// Recreate channel script.
			function recreateChannel()
			{
				channel.clone().then(newChannel => // Clone the original channel.
				{
					channel.delete(); // Delete the original channel.
					if (channel.id != interaction.channel.id) interaction.reply(`:white_check_mark: <#${channel.id}> has been **recreated** successfully!`);
				});
			};
		}
		catch (err)
		{
			interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] channel ${interaction.options.getSubcommand()}, ${err}, ${Date.now()}`);
		};
	},
	get data()
	{
		return new SlashCommandBuilder()
		.setName(this.name)
		.setDescription('Channel dedicated commands.')
		.addSubcommand(
			cmd => cmd
			.setName('clone')
			.setDescription('Clone a channel.')
			.addChannelOption(
				opt => opt
				.setName('channel')
				.setDescription('Channel to clone.')
			)
		).addSubcommand(
			cmd => cmd
			.setName('recreate')
			.setDescription('Recreate a channel.')
			.addChannelOption(
				opt => opt
				.setName('channel')
				.setDescription('Channel to recreate.')
			)
		).setDefaultMemberPermissions(this.permission)
	}
};