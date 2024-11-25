const { fixMissingConfig } = require('../../functions/missingConfig');
const { EmbedBuilder } = require('discord.js');

module.exports =
{
    name: 'antilinksButton',
    ownerOnly: false,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            db.query('SELECT * FROM config WHERE guild = ?', [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = fixMissingConfig(guild);

                let spamStatus = ':x: Inactive';
                let warnsStatus = ':x: Inactive';
                let pingStatus = ':x: Inactive';

                if (data[0].antispam != 0)
                {
                    const [ignoreBot, maxMessages, interval, maxWarns, sanction] = data[0].antispam.split(' ');
                    spamStatus = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBot == 1 ? 'Yes' : 'No'}.\n**Spam Detection:** More than ${maxMessages} messages in ${interval} seconds.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} minutes`}`;
                };

                if (data[0].warn != 0)
                {
                    const [maxWarns, sanction] = data[0].warn.split(' ');
                    warnsStatus = `:white_check_mark: Active.\n**Maximum Warns**: ${maxWarns} warns.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} hours`}`;
                };

                if (data[0].antipings != 0)
                {
                    const [ignoreBots, sanction] = data[0].antipings.split(' ');
                    pingStatus = `:white_check_mark: Active.\n**Ignore Bots**: ${ignoreBots == 1 ? 'Yes' : 'No'}.\n**Sanction**: ${sanction == 'ban' ? 'Ban' : `Mute for ${sanction} minutes`}`;
                };

                const embed = new EmbedBuilder()
                .setColor('Orange')
                .setAuthor({ name: 'Configuration Panel', iconURL: client.user.avatarURL() })
                .setDescription('Press the button with the **emoji corresponding** to **the option** you want to modify.')
                .addFields([{ name: ':hand_splayed:・Anti spam:', value: `>>> **Status**: ${spamStatus}.\n**Function**: Prevent the members from **spamming messages**.` }])
                .addFields([{ name: ':warning:・Warns:', value: `>>> **Status**: ${warnsStatus}.\n**Function**: The member **is sanctionned** if its warns count reached the **maximum amount**.` }])
                .addFields([{ name: ':loud_sound:・Anti pings:', value: `>>> **Status**: ${pingStatus}.\n**Function**: Prevent the members from using **@everyone and @here**.` }])
                .addFields([{ name: ':globe_with_meridians:・Anti links:', value: `>>> **Status**: ${data[0].antilinks == 0 ? ':white_check_mark: Active' : data[0].antilinks == 1 ? ':lock: Enforced (bots too)' : ':x: Inactive'}.\n**Function**: Delete messages **containing links**.` }])
                .setThumbnail(client.user.avatarURL())
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                db.query('UPDATE config SET antilinks = ? WHERE guild = ?', [data[0].antilinks == 0 ? 1 : data[0].antilinks == 1 ? 2 : 0, guild.id], async (err) =>
                {
                    if (err) throw err;
                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate();
                });
            });
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] antilinksButton, ${err}, ${Date.now()}`);
        };
    }
};