const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "unlock",
    type: "moderation",
    permission: PermissionsBitField.Flags.ManageChannels,
    async run(client, db, interaction)
    {
        try
        {
            var channel = interaction.options.getChannel("channel");
            if (!channel) channel = interaction.channel; // Select the current channel if nothing is specified.

            const guild = interaction.guild;
            const mod = interaction.member;

		    if (channel.permissionOverwrites.cache.get(guild.roles.everyone.id)?.allow.toArray(false).includes("SendMessages")) return interaction.reply({ content: ":warning: This channel isn't locked.", flags: MessageFlags.Ephemeral });
	        if (!channel.manageable) return interaction.reply({ content: ":warning: Impossible to unlock this channel.", flags: MessageFlags.Ephemeral });

	        channel.permissionOverwrites.edit(guild.roles.everyone.id,
            {
    	        SendMessages: true // Add the SendMessages permission for everyone.
	        }).then(() =>
            {
	            const embed = new EmbedBuilder()
    	        .setColor("Gold")
    	        .setDescription(`:unlock: This channel is now unlocked.\n:man_judge: **Moderator**: <@${mod.id}> @${mod.user.username}.`)

                channel.send({ embeds: [embed] });
                interaction.reply({ content: ":white_check_mark: Done!", flags: MessageFlags.Ephemeral });
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
        .setDescription("Unlock a channel.")
        .addChannelOption(
            opt => opt
            .setName("channel")
            .setDescription("Channel to unlock.")
        )
    }
};