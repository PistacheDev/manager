const { PermissionsBitField, SlashCommandBuilder } = require("discord.js");

module.exports =
{
    name: "clear",
    type: "moderation",
    permission: PermissionsBitField.Flags.ManageMessages,
    async run(client, db, interaction)
    {
        try
        {
            var channel = interaction.options.getChannel("channel");
            if (!channel) channel = interaction.channel; // Select the current channel if nothing is specified.

            const amount = interaction.options.getNumber("amount");
	        const messages = await channel.messages.fetch({ limit: 100 }); // Fetch the 100 latest messages.

    	    if (amount < 1 || amount > 100) return interaction.reply(":warning: Please! Enter a number **between 1** and **100**!");
    	    if (messages.length <= 0) return interaction.reply(":warning: **No message available** in this channel!");

	        channel.bulkDelete(amount).then(async () =>
            {
    	        const deletedCount = Math.min(amount, messages.size); // Calculate the number of deleted messages.
                let messageToDelete;

                if (channel.id != interaction.channel.id)
                {
                    interaction.reply(`:white_check_mark: **${deletedCount} messages** has been **successfully deleted** in <#${channel.id}>!`);
                    channel.send(`\`${deletedCount}\` messages were **deleted** by <@${interaction.user.id}>.`).then(sentMessage =>
                    {
                        messageToDelete = sentMessage; // Set the message to delete.
                    });
                }
                else
                {
                    interaction.reply(`:white_check_mark: **${deletedCount} messages** has been **successfully deleted**!`).then(sentMessage =>
                    {
                        messageToDelete = sentMessage;
                    });
                };

                setTimeout(() =>
                {
                    messageToDelete.delete(); // Delete the message after 2 seconds.
                }, 2000);
	        });
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
        .setDescription("Delete messages in a channel.")
        .addNumberOption(
            opt => opt
            .setName("amount")
            .setDescription("Amount of messages to delete.")
            .setRequired(true)
        ).addChannelOption(
            opt => opt
            .setName("channel")
            .setDescription("Channel to clear.")
        ).setDefaultMemberPermissions(this.permission)
    }
};