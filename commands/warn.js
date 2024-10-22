const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { generateString } = require('../functions/stringGenerator');

module.exports =
{
    name: 'warn',
    type: 'moderation',
    permission: PermissionsBitField.Flags.ModerateMembers,
    async run(client, db, interaction)
    {
        try
        {
            const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id); // Fetch the user in the server list.
            const reason = interaction.options.getString('reason');
            const warnID = `WARN-${generateString()}`; // Generate an ID.

            // Some verifications.
            if (target.user.bot) return interaction.reply(':warning: You can\'t warn **a bot**!');
            if (target.id == interaction.user.id) return interaction.reply(':warning: You can\'t warn **yourself**!');
            if (interaction.guild.ownerId == target.id) return interaction.reply(':warning: You can\'t warn the **server owner**!');
            if (interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) return interaction.reply(':warning: You can\'t warn **this member**!');
            if (interaction.user.id != interaction.guild.ownerId && target.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(`:warning: **Only the owner** can warn an administrator!`);
            if (target.id == client.user.id) return interaction.reply(':warning: You can\'t warn **the application** with this command!');

            // Add the warn to the database.
            db.query('INSERT INTO warns (`guild`, `warnID`, `target`, `moderator`, `reason`, `date`) VALUES (?, ?, ?, ?, ?, ?)', [interaction.guild.id, warnID, target.id, interaction.user.id, reason.replace(/'/g, "\\'"), Date.now()], async () =>
            {
                interaction.reply(`:warning: <@${target.id}> @${target.user.username}, you have been warned by <@${interaction.user.id}> @${interaction.user.username}!\n:man_judge: **Reason**: \`${reason}\`.\n:paperclip: **Warn ID**: \`${warnID}\`.`);
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
        .setDescription('Warn a member.')
        .addUserOption(
            opt => opt
            .setName('user')
            .setDescription('Member to warn.')
            .setRequired(true)
        ).addStringOption(
            opt => opt
            .setName('reason')
            .setDescription('Sanction reason.')
            .setRequired(true)
        ).setDefaultMemberPermissions(this.permission)
    }
};