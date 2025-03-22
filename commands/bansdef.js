const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports =
{
    name: "bansdef",
    type: "moderation",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        const member = interaction.member;

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

        async function list()
        {
            db.query("SELECT * FROM bans WHERE guild = ?", [guild.id], async (err, data) =>
            {
                if (err) throw err;
                await data.sort((a, b) => parseInt(b.date) - parseInt(a.date));
                const loop = data.length > 10 ? 10 : data.length;

                let embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(data.length < 1 ? "Nobody has been definitively banned from this server yet." : `Bans count: **${data.length.toString()} ban(s)**.`)

                for (let i = 0; i < loop; i++)
                {
                    embed.addFields([{ name: `${i + 1}) @${client.users.cache.get(data[i].user).username}:`, value: `**ID**: ${data[i].user}.\n**Moderator**: <@${await data[i].moderator}>.\n**Sanction Date**: <t:${Math.floor(parseInt(data[i].date / 1000))}>.\n**Reason**: \`${data[i].reason}\`.` }]); 
                };

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("bansdefPrevious")
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("bansdefSearch")
                    .setEmoji("🔍")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(data.length < 11)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("bansdefNext")
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(data.length < 11)
                );

                await interaction.reply({ embeds: [embed], components: [buttons] });
            });
        };

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
                    interaction.reply({ content: ":white_check_mark: Done.", flags: MessageFlags.Ephemeral });
                });
            });
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Definitive bans dedicated commands.")
        .addSubcommand(cmd => cmd
            .setName("list")
            .setDescription("List every definitive bans of the server.")
        ).addSubcommand(cmd => cmd
            .setName("remove")
            .setDescription("Revoke a definitive ban.")
            .addStringOption(opt => opt
                .setName("id")
                .setDescription("The user's ID.")
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(this.permission);
    }
};