const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { levelUp } = require("../../functions/levels");

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
            const data = interaction.message.content.match(/\[\d+\]/)[0].replace(/\D/g, ""); // Extract the data in spoiler.
            const amountXP = data.split("-")[0];
            const ID = data.split("-")[1];

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
                    levelUp(guild, interaction.member, currentLevel, maxLevel, newXP);
                });
            });

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription(`:tada: The **first person** who click on the **button bellow** will gain **${amountXP} XP points**!\n**Giveaway by** <@${ID}>!`)

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
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};