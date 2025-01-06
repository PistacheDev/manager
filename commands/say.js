const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
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
            if (filter.isProfane(message)) return interaction.reply({ content: ":warning: Please, be polite!", flags: MessageFlags.Ephemeral }); // If an insult has been detected.

            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription(`${message} - By <@${interaction.user.id}>`)

            interaction.channel.send({ embeds: [embed] });
        }
        catch (err)
        {
            console.error(`[error] ${this.name}, ${err}, ${Date.now()}`);
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