const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports =
{
    name: "dropxpButton",
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            const user = interaction.user;

            interaction.message.delete(); // Avoid to give XP to several users.
            const amountXP = interaction.message.content.match(/\[\d+\]/)[0].replace(/\D/g, ""); // Extract the number in the spoiler.

            db.query("SELECT * FROM xp WHERE user = ? AND guild = ?", [user.id, guild.id], async (err, data) =>
            {
                if (err) throw err;

                let newXP = parseInt(amountXP);
                let currentLevel = 0;

                if (data.length < 1)
                {
                    db.query("INSERT INTO xp (`user`, `guild`, `xp`) VALUES (?, ?, ?)", [user.id, guild.id, amountXP], async (err) =>
                    {
                        if (err) throw err;
                    });
                }
                else
                {
                    newXP = parseInt(data[0].xp) + parseInt(amountXP);
                    currentLevel = parseInt(data[0].level);

                    db.query("UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?", [newXP, currentLevel, guild.id, user.id], async (err) =>
                    {
                        if (err) throw err;
                    });
                };

                db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
                {
                    if (err) throw err;

                    const [alert, maxXP, maxLevel] = config[0].xp.split(" ");
                    if (currentLevel == maxLevel || currentLevel > maxLevel) return; 

                    let nextLevel = 500 + (currentLevel * 10);
                    let loop = 0;

                    while (newXP >= nextLevel && loop < 3) // Level up while the user has enough XP.
                    {
                        newXP -= nextLevel;
                        currentLevel += 1;
                        nextLevel = 500 + (currentLevel * 10);
                        loop += 1;
                        if (currentLevel > maxLevel) currentLevel = 0;

                        for (let i = 0; i < 4; i++)
                        {
                            const goal = config[0].xpgoals.split(" ")[i];

                            if (goal != 0)
                            {
                                const [requiredLevel, roleID] = goal.split("-");

                                if (currentLevel + 1 >= requiredLevel && !interaction.member.roles.cache.has(roleID))
                                {
                                    interaction.member.roles.add(roleID);
                                };
                            };
                        };

                        db.query("UPDATE xp SET xp = ?, level = ? WHERE guild = ? AND user = ?", [newXP, currentLevel, guild.id, user.id], async (err) =>
                        {
                            if (err) throw err;
                        });

                        if (currentLevel == maxLevel) break; // Stop level up the user if he reached the max level.
                    };
                });
            });

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription(`:tada: The **first person** who click on the **button bellow** will gain **${amountXP} XP points**!`)

            var button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("dropxpButton")
                .setLabel("Claim the reward")
                .setStyle(ButtonStyle.Success)
                .setDisabled(true)
            )

            interaction.channel.send({ content: `Claimed by <@${user.id}> @${user.username}!`, embeds: [embed], components: [button] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] dropxpButton, ${err}, ${Date.now()}`);
        };
    }
};