const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'repair',
    type: 'management',
    ownerOnly: true,
    async run(client, db, interaction)
    {
        try
        {
            db.query('SELECT * FROM config WHERE guild = ?', [interaction.guild.id], async (err, data) =>
            {
                if (data.length > 0) return interaction.reply(':warning: Your server is **already registered** in the database!');

                // Insert the server in the database.
                db.query('INSERT INTO config (`guild`) VALUES (?)', [interaction.guild.id], async (err) =>
                {
                    await interaction.reply(':white_check_mark: Your server has been **successfully registered** in the database!');
                });
            }); 
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] repair, ${err}, ${Date.now()}`);
        };
    },
    get data() {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription('Add manually your server in the database.')
    }
};