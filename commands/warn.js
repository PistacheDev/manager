const { PermissionsBitField, SlashCommandBuilder, MessageFlags, EmbedBuilder } = require("discord.js");
const Perms = PermissionsBitField.Flags;
const { generateString } = require("../functions/stringGenerator");

module.exports =
{
    name: "warn",
    type: "moderation",
    permission: Perms.ModerateMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.
            const reason = interaction.options.getString("reason");
            const warnID = `WARN-${generateString()}`; // Generate an ID.

            const guild = interaction.guild;
            const mod = interaction.member;
            const targetID = target.id;
            const ownerID = guild.ownerId;

            if (target.user.bot) return interaction.reply({ content: ":warning: You can't warn a bot!", flags: MessageFlags.Ephemeral});
            if (targetID == mod.id) return interaction.reply({ content: ":warning: You can't warn yourself!", flags: MessageFlags.Ephemeral });
            if (ownerID == targetID) return interaction.reply({ content: ":warning: You can't warn the server owner!", flags: MessageFlags.Ephemeral });
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply({ content: ":warning: You can't warn this member!", flags: MessageFlags.Ephemeral });
            if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply({ content: ":warning: Only the owner can warn an administrator!", flags: MessageFlags.Ephemeral });
            if (targetID == client.user.id) return interaction.reply({ content: ":warning: You can't warn the application with this command!", flags: MessageFlags.Ephemeral});

            let config;
            let warnsCount;

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
            {
                if (err) throw err;
                config = data[0];
            });

            if (config.warn == 0) // Option disabled.
            {
                interaction.reply({ content: ":warning: The warn system is turned off for this server!", falgs: MessageFlags.Ephemeral });
                return;
            };

            db.query("SELECT * FROM warns WHERE target = ? AND guild = ?", [targetID, guild.id], async (err, data) =>
            {
                if (err) throw err;
                warnsCount = data.length + 1; // Count the number of active warns.
            });

            // Add the warn to the database.
            db.query("INSERT INTO warns (`guild`, `warnID`, `target`, `moderator`, `reason`, `date`) VALUES (?, ?, ?, ?, ?, ?)", [guild.id, warnID, targetID, mod.id, reason.replace(/"/g, "\\'"), Date.now()], async (err) =>
            {
                if (err) throw err;
            });

            // Read the config.
            const [maxWarns, sanction] = config.warn.split(" ");

            if (warnsCount > maxWarns)
            {
                if (sanction == "ban")
                {
                    target.ban({ reason: `[Warns] Banned after ${data.length} warns.` }).then(() =>
                    {
                        const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setThumbnail(target.user.avatarURL())
                        .setDescription(`:man_judge: <@${targetID}> has been banned after ${warnsCount} warns!`)
                        .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Ban Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                        .addFields([{ name: ":grey_question:・Reason:", value: `\`\`\`${reason}\`\`\`` }])
                        .setTimestamp()
                        .setFooter({ text: target.user.username, iconURL: target.user.avatarURL() })

                        interaction.channel.send({ embeds: [embed] });
                        interaction.deferUpdate();

                        const notif = new EmbedBuilder()
                        .setColor("Red")
                        .setThumbnail(guild.iconURL())
                        .setDescription(`:scales: You have been banned from **${guild.name}** after ${warnsCount} warns!`)
                        .addFields([{ name: ":man_judge:・Moderator:", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Ban Date**: <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                        .addFields([{ name: ":grey_question:・Reason:", value: `\`\`\`${reason}\`\`\`` }])
                        .setTimestamp()
                        .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                        target.user.createDM({ force: true }).send({ embeds: [notif] });
                    });
                }
                else
                {
                    target.timeout(sanction * 3600000).then(() =>
                    {
                        const embed = new EmbedBuilder()
                        .setColor("Yellow")
                        .setThumbnail(target.user.avatarURL())
                        .setDescription(`:man_judge: <@${targetID}> has been muted after ${warnsCount} warns!`)
                        .addFields([{ name: ":man_judge:・Moderator :", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Mute Duration**: ${time} ${scaleStr}.\n**Sanction Date** : <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                        .addFields([{ name: ":grey_question:・Reason :", value: `\`\`\`${reason}\`\`\`` }])
                        .setTimestamp()
                        .setFooter({ text: target.user.username, iconURL: target.user.avatarURL() })

                        interaction.channel.send({ embeds: [embed] });
                        interaction.deferUpdate();

                        const notif = new EmbedBuilder()
                        .setColor("Yellow")
                        .setThumbnail(guild.iconURL())
                        .setDescription(`:scales: You have been muted in **${guild.name}** after ${warnsCount} warns!`)
                        .addFields([{ name: ":man_judge:・Moderator :", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Mute Duration**: ${time} ${scaleStr}.\n**Sanction Date** : <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                        .addFields([{ name: ":grey_question:・Reason :", value: `\`\`\`${reason}\`\`\`` }])
                        .setTimestamp()
                        .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                        target.user.createDM({ force: true }).send({ embeds: [notif] });
                    });
                };
            }
            else
            {
                interaction.channel.send(`:warning: <@${targetID}>, you have been warned by <@${mod.id}>!\n:paperclip: **Warn ID**: \`${warnID}\`.\n:man_judge: **Reason**: \`${reason}\`.`);
                interaction.deferUpdate();
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
        .setDescription("Warn a member.")
        .addUserOption(
            opt => opt
            .setName("user")
            .setDescription("Member to warn.")
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName("reason")
            .setDescription("Sanction reason.")
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};