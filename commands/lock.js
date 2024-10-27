const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'lock',
    type: 'moderation',
    permission: PermissionsBitField.Flags.ManageChannels,
    async run(client, db, interaction)
    {
        try
        {
            // Command options.
            var channel = interaction.options.getChannel('channel');
            if (!channel) channel = interaction.channel; // Select the current channel if nothing is specified.
            const reason = interaction.options.getString('reason');

            // Some shortcuts.
            const guild = interaction.guild;
            const mod = interaction.member;

            // Some verifications.
            if (channel.permissionOverwrites.cache.get(guild.roles.everyone.id)?.deny.toArray(false).includes('SendMessages')) return interaction.reply(':warning: This channel is **already locked**!');
            if (!channel.manageable) return interaction.reply(':warning: **Impossible** to lock this channel!');

	        channel.permissionOverwrites.edit(guild.roles.everyone.id,
            {
                SendMessages: false // Remove the SendMessages permission for @everyone.
    	    }).then(() =>
            {
                const embed = new EmbedBuilder()
    	        .setColor('Red')
    	        .setDescription(`:lock: **This channel** is now **locked**.\n:man_judge: **Moderator**: <@${mod.id}>.\n:grey_question: **Reason**: ${reason}.`)

                if (channel.id != interaction.channel.id)
                {
                    channel.send({ embeds: [embed] });
    	            interaction.reply(`:white_check_mark: <#${channel.id}> has been **locked successfully**!`);
                } else interaction.reply({ embeds: [embed] });
    	    });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] lock, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Lock a channel.')
        .addStringOption(
            opt => opt
            .setName('reason')
            .setDescription('Sanction reason.')
            .setRequired(true)
        ).addChannelOption(
            opt => opt
            .setName('channel')
            .setDescription('Channel to lock.')
        ).setDefaultMemberPermissions(this.permission)
    }
};