const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { fixMissingConfig } = require("../functions/missingConfig");
const { levelUp, levelDown } = require("../functions/levels");
const { removeGoalRoles } = require("../functions/xpGoals");

module.exports =
{
    name: "xpadmin",
    type: "management",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            var target = interaction.options.getUser("user");
            if (!target) target = interaction.member; // Select the current user if nothing is specified.
            target = guild.members.cache.get(target.id); // Fetch the user in the server list.

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                if (data[0].xp == 0) return interaction.reply({ content: ":warning: The XP system is disabled in this server!", flags: MessageFlags.Ephemeral });

                // Check what sub command has been executed.
                switch (interaction.options.getSubcommand())
                {
                    case "give":
                        giveXP();
                        break;
                    case "remove":
                        removeXP();
                        break;
                    case "remove-all":
                        removeAll();
                        break;
                    case "clear":
                        clearXP();
                        break;
                    case "drop":
                        dropXP();
                        break;
                    default:
                        interaction.reply({ content: ":warning: Command not found!", flags: MessageFlags.Ephemeral });
                        break;
                };
            });

            // Give some XP to a member.
            function giveXP()
            {
                const xpToGive = interaction.options.getNumber("amount");

                db.query("SELECT * FROM xp WHERE guild = ? AND user = ?", [guild.id, target.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (xpToGive > 1000 || xpToGive < 1) return interaction.reply({ content: ":warning: You can't give more than 1000 XP points and less than 1 XP point per giveaway!", flags: MessageFlags.Ephemeral });
                    if (data.length < 1)
                    {
                        db.query("INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)", [target.id, guild.id, 0], async (err) =>
                        {
                            if (err) throw err;
                            setTimeout(() => {}, 100); // Wait to let the database correctly insert the data.
                        });
                    };

                    db.query("UPDATE xp SET xp = ? WHERE guild = ? AND user = ?", [xpToGive + parseInt(data[0].xp), guild.id, target.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.deferUpdate();

                        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
                        {
                            if (err) throw err;

                            const currentXP = parseInt(xpToGive + parseInt(data[0].xp));
                            const currentLevel = parseInt(data[0].level);
                            const [alert, maxXP, maxLevel] = config[0].xp.split(" ");

                            if (currentLevel == maxLevel || currentLevel > maxLevel) return;
                            levelUp(guild, target, currentLevel, maxLevel, currentXP);
                        });
                    });
                });
            };

            // Remove some XP to a member.
            function removeXP()
            {
                const xpToRemove = interaction.options.getNumber("amount");

                db.query("SELECT * FROM xp WHERE guild = ? AND user = ?", [guild.id, target.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1) return interaction.reply({ content: ":warning: This user doesn't have any XP!", flags: MessageFlags.Ephemeral });
                    if (xpToRemove > 1000 || xpToRemove < 1) return interaction.reply({ content: ":warning: You can't remove more than 1000 XP points and less than 1 XP point per sanction!", flags: MessageFlags.Ephemeral });

                    db.query("UPDATE xp SET xp = ? WHERE guild = ? AND user = ?", [parseInt(data[0].xp) - xpToRemove, guild.id, target.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.deferUpdate();

                        const xp = parseInt(parseInt(data[0].xp) - xpToRemove);
                        const level = parseInt(data[0].level);
                        levelDown(guild, target, level, xp);
                    });
                });
            };

            // Remove the XP for the whole server.
            function removeAll()
            {
                if (interaction.user.id != guild.ownerId) return interaction.reply({ content: ":warning: This interaction is restricted to the server owner only.", flags: MessageFlags.Ephemeral });

                db.query("DELETE FROM xp WHERE guild = ?", [guild.id], async (err) =>
                {
                    if (err) throw err;
                    interaction.deferUpdate();

                    // Remove the goals role for everyone.
                    guild.members.forEach(async member =>
                    {
                        if (member.bot) return;
                        removeGoalRoles(member, guild, 0);
                    });
                });
            };

            // Remove the whole XP of a member.
            function clearXP()
            {
                db.query("SELECT * FROM xp WHERE guild = ? AND user = ?", [guild.id, target.id], async (err, data) =>
                {
                    if (err) throw err;
                    if (data.length < 1) return interaction.reply({ content: ":warning: This user doesn't have any XP!", flags: MessageFlags.Ephemeral });

                    db.query("DELETE FROM xp WHERE guild = ? AND user = ?", [guild.id, target.id], async (err) =>
                    {
                        if (err) throw err;
                        interaction.deferUpdate();
                    });
                });
            };

            // Drop a little XP reward.
            function dropXP()
            {
                const amountXP = interaction.options.getNumber("amount");
                if (amountXP > 1000 || amountXP < 1) return interaction.reply({ content: ":warning: You can't drop more than 1000 XP points and less than 1 XP point!", flags: MessageFlags.Ephemeral });

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setDescription(`:tada: The **first person** who clicks on the **button bellow** will receive **${amountXP} XP points**!\n**Giveaway by** <@${interaction.user.id}>!`)

                var button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("dropxpButton")
                    .setLabel("Claim the reward")
                    .setStyle(ButtonStyle.Success)
                )

                interaction.channel.send({ content: `||[${amountXP}-${interaction.user.id}]||`, embeds: [embed], components: [button] });
                interaction.deferUpdate();
            };
        }
        catch (err)
        {
            console.error(`[error] ${this.name} ${interaction.options.getSubcommand()}, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Admin experience dedicated commands.")
        .addSubcommand(
            cmd => cmd
            .setName("give")
            .setDescription("Give XP points to a member.")
            .addUserOption(
                opt => opt
                .setName("user")
                .setDescription("Member who will receive the XP.")
                .setRequired(true)
            ).addNumberOption(
                opt => opt
                .setName("amount")
                .setDescription("Amount of XP to give.")
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName("remove")
            .setDescription("Remove XP points to a member.")
            .addUserOption(
                opt => opt
                .setName("user")
                .setDescription("User who will lost the XP.")
                .setRequired(true)
            ).addNumberOption(
                opt => opt
                .setName("amount")
                .setDescription("Amount of XP to remove.")
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName("remove-all")
            .setDescription("Remove the XP for every members of the server.")
        ).addSubcommand(
            cmd => cmd
            .setName("clear")
            .setDescription("Remove all the XP of a member.")
            .addUserOption(
                opt => opt
                .setName("user")
                .setDescription("User who will lost all of his XP.")
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName("drop")
            .setDescription("Drop some XP points!")
            .addNumberOption(
                opt => opt
                .setName("amount")
                .setDescription("Amount of XP points to drop.")
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(this.permission)
    }
};