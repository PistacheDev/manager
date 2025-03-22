const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
const { Filter } = require("profanity-check");
const filter = new Filter();

module.exports =
{
    name: "say",
    type: "gaming",
    async run(client, db, interaction)
    {
        const message = interaction.options.getString("message");
        if (filter.isProfane(message)) return interaction.reply({ content: ":warning: Please, be polite!", flags: MessageFlags.Ephemeral });

        const embed = new EmbedBuilder()
        .setColor("Orange")
        .setDescription(`${message} - By <@${interaction.user.id}>`)

        interaction.channel.send({ embeds: [embed] });
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Make the bot say something (not anonymous).")
        .addStringOption(opt => opt
            .setName("message")
            .setDescription("Message to say.")
            .setRequired(true)
        )
    }
};