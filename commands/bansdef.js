const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports =
{
    name: "bansdef",
    type: "moderation",
    permission: PermissionsBitField.Flags.Administrator, // First layer.
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        const member = interaction.member;

        switch (interaction.options.getSubcommand()) // Check what sub command has been executed.
		{
			case "list":
				list();
				break;
			case "remove":
				remove();
				break;
			default:
				interaction.reply(":warning: Unknown **command**!");
				break;
		};

        async function list()
        {
            db.query("SELECT * FROM bans WHERE guild = ?", [guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return interaction.reply(":warning: Nobody **has been definitively banned** from this server!");
                await data.sort((a, b) => parseInt(b.date) - parseInt(a.date)); // Sort by recent date.

                let embed = new EmbedBuilder()
                .setColor("Red")
                .setAuthor({ name: `${guild.name}'s definitively bans:`, iconURL: guild.iconURL() })
                .setThumbnail(guild.iconURL())
                .setDescription(`Bans count: **${data.length.toString()} bans**.`)
                .setTimestamp()

                // Build the embed.
                for (let i = 0; i < data.length; i++)
                {
                    embed.addFields([{ name: `${i + 1}) @${client.users.cache.get(data[i].user).username}:`, value: `**ID**: ${data[i].user}.\n**Moderator**: <@${await data[i].moderator}>.\n**Sanction Date**: <t:${Math.floor(parseInt(data[i].date / 1000))}>.\n**Reason**: \`${data[i].reason}\`.` }]); 
                };

                await interaction.reply({ embeds: [embed] });
            });
        };

        async function remove()
        {
            const ID = interaction.options.getString("id");
            if (guild.ownerId != member.id) return interaction.reply(":warning: This interaction **is restricted** to the **server's owner**.");
            if (!client.users.cache.get(ID)) return interaction.reply(":warning: This user **doesn't exist**!");

            db.query("SELECT * FROM bans WHERE user = ? AND guild = ?", [member.id, guild.id], async (err, data) =>
            {
                if (err) throw err;
                if (data.length < 1) return interaction.reply(":warning: This user **hasn't been definitively banned** from this server!");

                db.query("DELETE FROM bans WHERE user = ? AND guild = ?", [member.id, guild.id], async (err) =>
                {
                    if (err) throw err;
                    interaction.reply(`:white_check_mark: @${client.users.cache.get(ID).username}'s definitive ban (${ID}) has been **successfully removed**!`);
                });
            });
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