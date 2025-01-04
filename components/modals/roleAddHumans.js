const { PermissionsBitField } = require("discord.js");

module.exports =
{
    name: "roleAddHumansModal",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;
            const role = interaction.fields.getTextInputValue("option");
            if (!guild.roles.cache.get(role)) return interaction.reply(":warning: This role **doesn't exist**!");

            interaction.message.delete();
            const members = await guild.members.fetch();
            const humans = members.filter(member => !member.user.bot);

            humans.forEach(member =>
            {
                member.roles.add(role).catch(err => interaction.channel.send(`:warning: **Impossible** to give the role to <@${member.id}>!\n\`\`\`${err}\`\`\``));
            });

            await interaction.reply(`:white_check_mark: Successfully **attribuated the @${guild.roles.cache.get(role).name} role** to **${humans.size} members**!`);
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
        };
    }
};