const { PermissionsBitField, SlashCommandBuilder } = require("discord.js");
const Perms = PermissionsBitField.Flags; // Shortcut.
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

            if (target.user.bot) return interaction.reply(":warning: You can\'t warn **a bot**!");
            if (targetID == mod.id) return interaction.reply(":warning: You can\'t warn **yourself**!");
            if (ownerID == targetID) return interaction.reply(":warning: You can\'t warn the **server owner**!");
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(":warning: You can\'t warn **this member**!");
            if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply(`:warning: **Only the owner** can warn an administrator!`);
            if (targetID == client.user.id) return interaction.reply(":warning: You can\'t warn **the application** with this command!");

            db.query("INSERT INTO warns (`guild`, `warnID`, `target`, `moderator`, `reason`, `date`) VALUES (?, ?, ?, ?, ?, ?)", [guild.id, warnID, targetID, mod.id, reason.replace(/"/g, "\\'"), Date.now()], async (err) =>
            {
                if (err) throw err;

                db.query("SELECT * FROM warns WHERE target = ? AND guild = ?", [targetID, guild.id], async (err, data) =>
                {
                    if (err) throw err;

                    db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
                    {
                        if (err) throw err;

                        if (config[0].warn == 0)
                        {
                            interaction.reply(`:warning: <@${targetID}>, you"ve been warned by <@${mod.id}>!\n:man_judge: **Reason**: \`${reason}\`.\n:paperclip: **Warn ID**: \`${warnID}\`.`);
                        }
                        else
                        {
                            const [maxWarns, sanction] = config[0].warn.split(" ");

                            if (data.length > maxWarns)
                            {
                                if (sanction == "ban")
                                {
                                    target.ban({ reason: `[Warns] Banned after ${data.length} warns.` }).then(() =>
                                    {
                                        interaction.reply(`:man_judge: @${target.user.username} (${targetID}) has been **banned for too many warns**!`);
                                    });
                                }
                                else
                                {
                                    target.timeout(sanction * 3600000).then(() =>
                                    {
                                        message.reply(`:man_judge: <@${targetID}>, you"ve been **muted for ${sanction} hours** for too many warns!`);
                                        db.query("DELETE FROM warns WHERE target = ? AND guild = ?", [targetID, guild.id], async (err) =>
                                        {
                                            if (err) throw err;
                                        });
                                    });
                                };
                            }
                            else
                            {
                                interaction.reply(`:warning: <@${targetID}>, you have been warned by <@${mod.id}>!\n:man_judge: **Reason**: \`${reason}\`.\n:paperclip: **Warn ID**: \`${warnID}\`.`);
                                if (data.length == maxWarns) interaction.channel.send(`:man_judge: Next time, you **will be ${sanction == "ban" ? "ban" : `mute for ${sanction} hours`}** for too many warns!`);
                            };
                        };
                    });
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] warn, ${err}, ${Date.now()}`);
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