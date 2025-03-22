const { PermissionsBitField, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "clear",
    type: "moderation",
    permission: PermissionsBitField.Flags.ManageMessages,
    async run(client, db, interaction)
    {
        var channel = interaction.options.getChannel("channel");
        if (!channel) channel = interaction.channel;

        const amount = interaction.options.getNumber("amount");
	    const messages = await channel.messages.fetch({ limit: 100 });

    	if (amount < 1 || amount > 100) return interaction.reply({ content: ":warning: Please, enter a number between 1 and 100!", flags: MessageFlags.Ephemeral });
    	if (messages.length <= 0) return interaction.reply({ content: ":warning: No message available in this channel!", flags: MessageFlags.Ephemeral });

	    channel.bulkDelete(amount).then(async () =>
        {
    	    const deleted = Math.min(amount, messages.size);
            interaction.reply({ content: `:white_check_mark: ${deleted} messages were deleted in <#${channel.id}>!`, flags: MessageFlags.Ephemeral });
            console.log(`[${this.name}] ${channel.id}, ${interaction.user.id}, ${amount}, ${deleted}, ${Date.now()}`);
	    });
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Delete messages in a channel.")
        .addNumberOption(opt => opt
            .setName("amount")
            .setDescription("Amount of messages to delete.")
            .setRequired(true)
        ).addChannelOption(opt => opt
            .setName("channel")
            .setDescription("Channel to clear.")
        ).setDefaultMemberPermissions(this.permission)
    }
};