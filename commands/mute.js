const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: "mute",
    type: "moderation",
    permission: Perms.ModerateMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = guild.members.cache.get(interaction.options.getUser("user").id); // Fetch the user in the server list.
            const time = interaction.options.getNumber("time");
            const scale = interaction.options.getString("scale");
            const reason = interaction.options.getString("reason");

            const guild = interaction.guild;
            const mod = interaction.member;
            const targetID = target.id;
            const ownerID = guild.ownerId;
            const scaleStr = scale == "m" ? "minutes" : scale == "h" ? "hours" : "days";

            if (targetID == mod.id) return interaction.reply(":warning: You can't mute **yourself**!");
            if (ownerID == targetID) return interaction.reply(":warning: You can't mute the **server owner**!");
            if (mod.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(":warning: You **can't mute** this member!");
            if (targetID == client.user.id) return interaction.reply(":warning: You **can't mute the application** with this command!");
            if (target.isCommunicationDisabled()) return interaction.reply(":warning: This member is **already muted**.");
            if (mod.id != ownerID && target.permissions.has(Perms.Administrator)) return interaction.reply(`:warning: **Only the owner** can ban an administrator!`);
            if (!target.moderatable) return interaction.reply(":warning: **Impossible** to mute this member!");

            let timeMs;
            if (scale == "m" || scale == "h" || scale == "d")
            {
                // Convert the time in ms.
                if (scale == "m") timeMs = time * 60000;
                if (scale == "h") timeMs = time * 3600000;
                if (scale == "d") timeMs = time * 86400000;
            } else return interaction.reply(":warning: The **scale** that you provided is **incorrect**!\nEnter `m` for **minutes**, `h` for **hours** or `d` for **days**.")

            if (timeMs < 60000 || timeMs > 604800000) return interaction.reply(":warning: You can't mute a member **less than 1 minute** and **more than 7 days**!");
            target.timeout(timeMs).then(() => {
                interaction.channel.send(`:man_judge: ${target.user.username} (${targetID}) has been muted by <@${mod.id}> for ${time} ${scaleStr}!\n**Reason**: **\`${reason}\`**`);
                interaction.deferUpdate();

                const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setThumbnail(guild.iconURL())
                .setDescription(`:scales: You"ve been muted in **${guild.name}**!`)
                .addFields([{ name: ":man_judge:・Moderator :", value: `>>> **User**: <@${mod.id}> @${mod.user.username}.\n**ID**: ${mod.id}.\n**Mute Duration**: ${time} ${scaleStr}.\n**Sanction Date** : <t:${Math.floor(Date.now() / 1000)}:F>.` }])
                .addFields([{ name: ":grey_question:・Reason :", value: `\`\`\`${reason}\`\`\`` }])
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                target.user.createDM({ force: true }).send({ embeds: [embed] });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] mute, ${err}, ${Date.now()}`);
        };
    },
    get data() {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Mute a member.")
        .addUserOption(
            opt => opt
            .setName("user")
            .setDescription("User to mute.")
            .setRequired(true)
        ).addNumberOption(
            opt => opt
            .setName("time")
            .setDescription("Mute duration in hours.")
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName("scale")
            .setDescription("Scale of time (m (minutes), h (hours) or d (days)).")
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName("reason")
            .setDescription("Sanction reason.")
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};