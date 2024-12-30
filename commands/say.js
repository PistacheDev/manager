const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const detector = require("profanity-check");
const filter = new detector.Filter();

module.exports =
{
    name: "say",
    type: "gaming",
    async run(client, db, interaction)
    {
        try
        {
            const message = interaction.options.getString("message");
            if (filter.isProfane(message)) return interaction.reply(":warning: Please, be **polite**!"); // If an insult has been detected.

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription(`${message} - By <@${interaction.user.id}>`)

            interaction.channel.send({ embeds: [embed] });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected error occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] say, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Make the bot say something (not anonymous).")
        .addStringOption(
            option => option
            .setName("message")
            .setDescription("Message to say.")
            .setRequired(true)
        )
    }
};