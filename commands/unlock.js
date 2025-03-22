const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "unlock",
    type: "moderation",
    permission: PermissionsBitField.Flags.ManageChannels,
    async run(client, db, interaction)
    {
        var channel = interaction.options.getChannel("channel");
        if (!channel) channel = interaction.channel;

        const guild = interaction.guild;
        const mod = interaction.member;

		if (channel.permissionOverwrites.cache.get(guild.roles.everyone.id)?.allow.toArray(false).includes("SendMessages")) return interaction.reply({ content: ":warning: This channel isn't locked.", flags: MessageFlags.Ephemeral });
	    if (!channel.manageable) return interaction.reply({ content: ":warning: Impossible to unlock this channel.", flags: MessageFlags.Ephemeral });

	    channel.permissionOverwrites.edit(guild.roles.everyone.id, { SendMessages: true }).then(() =>
        {
	        const embed = new EmbedBuilder()
    	    .setColor("Gold")
    	    .setDescription(`:unlock: This channel is now unlocked.\n:man_judge: **Moderator**: <@${mod.id}> @${mod.user.username}.`)

            channel.send({ embeds: [embed] });
            interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });
	    });
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Unlock a channel.")
        .addChannelOption(opt => opt
            .setName("channel")
            .setDescription("Channel to unlock.")
        ).setDefaultMemberPermissions(this.permission)
    }
};