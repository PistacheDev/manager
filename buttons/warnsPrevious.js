const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { warnsButtons } = require("../prefabs/warnsButtons");

module.exports =
{
    name: "warnsPreviousButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        const info = interaction.message.content.match(/\[(.*?)\]/)[0].replace(/[\[\]]/g, "");

        const targetID = info.split("-")[0];
        const page = parseInt(info.split("-")[1]);
        const range = (page - 2) * 10;

        db.query("SELECT * FROM warns WHERE guild = ? AND target = ?", [guild.id, targetID], async (err, data) =>
        {
            if (err) throw err;
            await data.sort((a, b) => parseInt(b.date) - parseInt(a.date));

            let embed = new EmbedBuilder()
            .setColor("Yellow")
            .setDescription(`@${guild.members.cache.get(targetID).user.username}'s warns count: **${data.length.toString()} warn(s)**.`)

            for (let i = 0; i < 10; i++)
            {
                if (!data[range + i]) break;
                embed.addFields([{ name: `${range + i + 1}) Warn \`${data[range + i].warnID}\`:`, value: `**Moderator**: <@${await data[range + i].moderator}>.\n**Sanction Date**: <t:${Math.floor(parseInt(data[range + i].date / 1000))}>.\n**Reason**: \`${data[range + i].reason}\`.` }]);
            };

            var buttons = warnsButtons(page - 1 <= 1, false);
            await interaction.message.edit({ content: `||[${targetID}-${page - 1}]||`, embeds: [embed], components: [buttons] });
            interaction.deferUpdate();
        });
    },
};