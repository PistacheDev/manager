const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "bansdef",
    type: "moderation",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            const member = interaction.member;

            // Check what sub command has been executed.
            switch (interaction.options.getSubcommand())
		    {
	    		case "list":
    				list();
				    break;
			    case "remove":
		    		remove();
	    			break;
    			default:
				    interaction.reply({ content: ":warning: Command not found!", flags: MessageFlags.Ephemeral });
			    	break;
		    };

            // List the definitive bans.
            async function list()
            {
                db.query("SELECT * FROM bans WHERE guild = ?", [guild.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1) return interaction.reply({ content: ":warning: Nobody has been definitively banned from this server!", flags: MessageFlags.Ephemeral });
                    await data.sort((a, b) => parseInt(b.date) - parseInt(a.date)); // Sort by recent date.

                    let embed = new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: `${guild.name}'s definitively bans:`, iconURL: guild.iconURL() })
                    .setThumbnail(guild.iconURL())
                    .setDescription(`Bans count: **${data.length.toString()} bans**.`)
                    .setTimestamp()

                    for (let i = 0; i < data.length; i++) // Build the embed.
                    {
                        embed.addFields([{ name: `${i + 1}) @${client.users.cache.get(data[i].user).username}:`, value: `**ID**: ${data[i].user}.\n**Moderator**: <@${await data[i].moderator}>.\n**Sanction Date**: <t:${Math.floor(parseInt(data[i].date / 1000))}>.\n**Reason**: \`${data[i].reason}\`.` }]); 
                    };

                    await interaction.reply({ embeds: [embed] });
                });
            };

            // Remove a definitive ban.
            async function remove()
            {
                const ID = interaction.options.getString("id");
                if (guild.ownerId != member.id) return interaction.reply({ content: ":warning: This interaction is restricted to the server owner.", flags: MessageFlags.Ephemeral });
                if (!client.users.cache.get(ID)) return interaction.reply({ content: ":warning: This user doesn't exist!", flags: MessageFlags.Ephemeral });

                db.query("SELECT * FROM bans WHERE user = ? AND guild = ?", [member.id, guild.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1) return interaction.reply({ content: ":warning: This user hasn't been definitively banned from this server!", flags: MessageFlags.Ephemeral });

                    db.query("DELETE FROM bans WHERE user = ? AND guild = ?", [member.id, guild.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.deferUpdate();
                    });
                });
            };
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
        .setDescription("Definitive bans dedicated commands.")
        .addSubcommand(
            cmd => cmd
            .setName("list")
            .setDescription("List every definitive bans of the server.")
        ).addSubcommand(
            cmd => cmd
            .setName("remove")
            .setDescription("Remove a definitive ban.")
            .addStringOption(
                opt => opt
                .setName("id")
                .setDescription("User ID.")
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(this.permission);
    }
};