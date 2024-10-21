const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports =
{
    name: 'unlock',
    type: 'moderation',
    permission: PermissionsBitField.Flags.ManageChannels,
    async run(client, db, interaction)
    {
        try
        {
            var channel = interaction.options.getChannel('channel');
            if (!channel) channel = interaction.channel; // Select the current channel if nothing is specified.

            // Some verifications.
		    if (channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id)?.allow.toArray(false).includes('SendMessages')) return interaction.reply(':warning: This channel **isn\'t locked**.');
	        if (!channel.manageable) return interaction.reply(':warning: **Impossible** to unlock this channel.');

	        channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id,
            {
    	        SendMessages: true // Add the SendMessages permission for @everyone.
	        }).then(() =>
            {
                if (channel.name.startsWith('[🔒]-')) channel.setName(`${channel.name.split('[🔒]-')[1]}`); // Remove the lock emoji from the channel name.

	            const embed = new EmbedBuilder()
    	        .setColor('Gold')
    	        .setDescription(`:unlock: **This channel** is now **unlocked**.\n:man_judge: **Moderator**: <@${interaction.user.id}> @${interaction.user.username}.`)

                if (channel.id != interaction.channel.id)
                {
                    channel.send({ embeds: [embed] });
                    interaction.reply(`:white_check_mark: <#${channel.id}> has been **unlocked successfully**!`);
                } else interaction.reply({ embeds: [embed] });
	        });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] unlock, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Unlock a channel.')
        .addChannelOption(
            opt => opt
            .setName('channel')
            .setDescription('Channel to unlock.')
        )
    }
};