const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: "ban",
    type: "moderation",
    permission: Perms.BanMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.
            const reason = interaction.options.getString("reason");
            const definitive = interaction.options.getBoolean("definitive");
            const deleteTime = interaction.options.getNumber("messages");

            const guild = interaction.guild;
            const mod = interaction.member;
            const targetID = target.id;
            const ownerID = guild.ownerId;

            if (targetID == mod.id) return interaction.reply(":warning: You can't ban **yourself**!" );
            if (ownerID == targetID) return interaction.reply(":warning: You can't ban the **server owner**!");
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(":warning: You **can't ban** this member!" );
            if (targetID == client.user.id) return interaction.reply(":warning: You can't **ban the application** with this command!" );
            if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply(`:warning: **Only the owner** can ban an administrator!`);
            if (!target.bannable) return interaction.reply(":warning: **Impossible** to ban this member!" );
            if (deleteTime && (deleteTime < 1 || deleteTime > 7)) return interaction.reply(":warning: You can\'t delete messages **older than 7 days** and **the minimum allowed is 1 day**.");

            target.ban({ reason: `[${mod.id}] ${reason}`, deleteMessageDays: deleteTime ? deleteTime : 0 }).then(() =>
            {
                interaction.channel.send(`:man_judge: ${target.user.username} (${targetID}) has been banned ${definitive ? "definitively" : ""} by <@${mod.id}>!\n**Reason**: **\`${reason}\`**`);
                interaction.deferUpdate();

                const embed = new EmbedBuilder()
                .setColor("Red")
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You've been banned ${definitive ? "definitively" : ""} from **${guild.name}**!`)
                .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Ban Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ":grey_question:・Reason:", value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                target.user.createDM({ force: true }).send({ embeds: [embed] });

                if (definitive)
                {
                    db.query("INSERT INTO bans (`guild`, `user`, `moderator`, `reason`, `date`) VALUES (?, ?, ?, ?, ?)", [guild.id, target.id, mod.id, reason.replace(/"/g, "\\'"), Date.now()], async (err) =>
                    {
                        if (err) throw err;
                    });
                };
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
        .setDescription("Ban a member.")
        .addUserOption(
            opt => opt
            .setName("user")
            .setDescription("Member to ban.")
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName("reason")
            .setDescription("Sanction reason.")
            .setRequired(true)
        ).addBooleanOption(
            opt => opt
            .setName("definitive")
            .setDescription("Auto-ban the user each time he tries to join the server even unbanned. ONLY revocable by the owner.")
            .setRequired(true)
        ).addNumberOption(
            opt => opt
            .setName("messages")
            .setDescription("Delete the messages sent in a period of time in days.")
        ).setDefaultMemberPermissions(this.permission)
    }
};