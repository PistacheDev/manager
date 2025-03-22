const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { bansdefButtons } = require("../prefabs/bansdefButtons");

module.exports =
{
    name: "bansdefPreviousButton",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        const guild = interaction.guild;
        const info = interaction.message.content.match(/\[(.*?)\]/)[0].replace(/[\[\]]/g, "");      
        const page = parseInt(info.split("-")[1]);
        const range = (page - 2) * 10;

        db.query("SELECT * FROM bans WHERE guild = ?", [guild.id], async (err, data) =>
        {
            if (err) throw err;
            await data.sort((a, b) => parseInt(b.date) - parseInt(a.date));

            let embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(data.length < 1 ? "Nobody has been definitively banned from this server yet." : `Bans count: **${data.length.toString()} ban(s)**.`);

            for (let i = 0; i < 10; i++)
            {
                if (!data[range + i]) break;
                embed.addFields([{ name: `${range + i + 1}) @${client.users.cache.get(data[range + i].user).username}:`, value: `**ID**: ${data[range + i].user}.\n**Moderator**: <@${await data[range + i].moderator}>.\n**Sanction Date**: <t:${Math.floor(parseInt(data[range + i].date / 1000))}>.\n**Reason**: \`${data[range + i].reason}\`.` }]);
            };

            var buttons = bansdefButtons(page - 1 <= 1, false);
            await interaction.message.edit({ content: `||[page-${page - 1}]||`, embeds: [embed], components: [buttons] });
            interaction.deferUpdate();
        });
    },
};