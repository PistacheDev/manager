const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "lock",
    type: "moderation",
    permission: PermissionsBitField.Flags.ManageChannels,
    async run(client, db, interaction)
    {
        var channel = interaction.options.getChannel("channel");
        const reason = interaction.options.getString("reason");

        const guild = interaction.guild;
        const mod = interaction.member;

        if (!channel) channel = interaction.channel;
        if (channel.permissionOverwrites.cache.get(guild.roles.everyone.id)?.deny.toArray(false).includes("SendMessages")) return interaction.reply({ content: ":warning: This channel is already locked!", flags: MessageFlags.Ephemeral });
        if (!channel.manageable) return interaction.reply({ content: ":warning: Impossible to lock this channel!", flags: MessageFlags.Ephemeral });

	    channel.permissionOverwrites.edit(guild.roles.everyone.id, { SendMessages: false }).then(() =>
        {
            const embed = new EmbedBuilder()
    	    .setColor("Red")
    	    .setDescription(`:lock: This channel is now locked.\n:man_judge: **Moderator**: <@${mod.id}>.\n:grey_question: **Reason**: ${reason}.`)

            channel.send({ embeds: [embed] });
    	    interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });
    	});
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Lock a channel.")
        .addStringOption(opt => opt
            .setName("reason")
            .setDescription("Sanction reason.")
            .setRequired(true)
        ).addChannelOption(opt => opt
            .setName("channel")
            .setDescription("Channel to lock.")
        ).setDefaultMemberPermissions(this.permission)
    }
};