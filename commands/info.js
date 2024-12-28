const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require("discord.js");
const config = require("../json/config.json");
const package = require("../package.json");
const channelTypes = require("../json/channels.json");

module.exports =
{
    name: "info",
    type: "utility",
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            switch (interaction.options.getSubcommand()) // Check what sub command has been executed.
            {
                case "application":
                    appInfo();
                    break;
                case "emoji":
                    emojiInfo();
                    break;
                case "role":
                    roleInfo();
                    break;
                case "channel":
                    channelInfo();
                    break;
                case "server":
                    guildInfo();
                    break;
                case "user":
                    userInfo();
                    break;
                default:
                    interaction.reply(":warning: Unknown **command**!");
                    break;
            };

            async function appInfo()
            {
                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setThumbnail(client.user.avatarURL())
                .addFields([{ name: ":robot:・**Identity**:", value: `>>> **Name**: <@${client.user.id}> ${client.user.username}.\n**Tag**: ${client.user.tag}.\n**ID**: ${client.user.id}.\n**Version**: ${config.version}.\n**Server Count**: ${client.guilds.cache.size} servers.` }])
                .addFields([{ name: ":gear:・**Settings**:", value: `>>> **Application Latency**: ${client.ws.ping}ms.\n**Nodejs**: ${process.version}.\n**Discord.js**: v${package.dependencies["discord.js"].split("^")[1]}.` }])
                .addFields([{ name: ":desktop:・**Host:**", value: ">>> **Host**: OVHcloud (Canada).\n**OS**: Fedora 40.\n**CPU**: 4 vCores.\n**RAM**: 8 GB.\n**Internet Speed**: 250 MB/sec." }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setURL(client.user.avatarURL())
                    .setLabel("Icon")
                    .setStyle(ButtonStyle.Link)
                ).addComponents(
                    new ButtonBuilder()
                    .setURL("https://github.com/PistacheDev/manager")
                    .setLabel("GitHub")
                    .setStyle(ButtonStyle.Link)
                ).addComponents(
                    new ButtonBuilder()
                    .setURL("https://discord.com/invite/RkB3ZQsmGV")
                    .setLabel("Discord")
                    .setStyle(ButtonStyle.Link)
                )

                await interaction.reply({ embeds: [embed], components: [buttons] });
            };

            async function emojiInfo()
            {
                const emojiID = interaction.options.getString("id");
                const emoji = guild.emojis.cache.get(emojiID); // Get the emoji in the server list.
                if (!emoji) return interaction.reply(":warning: This emoji **doesn't exist**!");

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setThumbnail(emoji.imageURL())
                .setDescription(`### Emoji information:\n >>> **Name**: ${emoji.name}.\n**ID**: ${emojiID}.\n**Animated**: ${emoji.animated ? "Yes" : "No"}.\n**Mention**: \`<:${emoji.name}:${emojiID}>\`.\n**Creation Date**: <t:${Math.floor(emoji.createdAt / 1000)}:F>.`)

                var button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setURL(emoji.imageURL())
                    .setLabel("Download")
                    .setStyle(ButtonStyle.Link)
                )

                await interaction.reply({ embeds: [embed], components: [button] });
            };

            async function roleInfo()
            {
                const role = interaction.options.getRole("role");

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setThumbnail(guild.iconURL())
                .setDescription(`### Role information:\n >>> **Name**: <@&${role.id}> \`${role.name}\`.\n**ID**: ${role.id}.\n**Administrator**: ${role.permissions.has(PermissionsBitField.Flags.Administrator) ? "Yes" : "No"}.\n**Mentionable**: ${role.mentionable ? "Yes" : "No"}.\n**Color**: ${role.hexColor}.\n**Position**: ${role.guild.roles.cache.size - role.position}/${role.guild.roles.cache.size}.\n**Creation Date**: <t:${Math.floor(role.createdAt / 1000)}:F>`)

                await interaction.reply({ embeds: [embed] });
            };

            async function channelInfo()
            {
                var channel = interaction.options.getChannel("channel");
                if (!channel) channel = interaction.channel; // Select the current channel if nothing is specified.

                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setThumbnail(guild.iconURL())
                .setDescription(`### Channel information:\n >>> **Name**: <#${channel.id}> \`${channel.name}\`.\n**Type**: ${channelTypes[channel.type.toString()]}.\n**Public**: ${channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id)?.deny.toArray(false).includes("ViewChannel") ? "No" : "Yes"}.\n**ID**: ${channel.id}.\n**Category**: ${channel.parent ? channel.parent.name : "None"}.\n**Position**: ${channel.position + 1}.\n**Creation Date**: <t:${Math.floor(channel.createdAt / 1000)}:F>.`)

                await interaction.reply({ embeds: [embed] });
            };

            async function guildInfo()
            {
                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setThumbnail(guild.iconURL())
                .setAuthor({ name: "Server information", iconURL: guild.iconURL() })
                .setTitle(guild.name)
                .addFields([{ name: ":identification_card:・**Basic information:**", value: `>>> **Name**: ${guild.name}.\n**ID**: ${guild.id}.\n**Creation Date**: <t:${Math.floor(guild.createdAt / 1000)}:F>.\n**Owner**: <@${guild.ownerId}>.` }])
                .addFields([{ name: ":bar_chart:・**Stats**:", value: `>>> **Members Count**: ${guild.memberCount} members.\n**Humans Count**: ${(await guild.members.fetch()).filter(member => !member.user.bot).size} humans.\n**Bots Count**: ${(await guild.members.fetch()).filter(member => member.user.bot).size} bots.\n**Channels and categories**: ${guild.channels.cache.size} channels and categories.\n**Roles**: ${guild.roles.cache.size - 1} roles.\n**Boost**: ${guild.premiumSubscriptionCount} boost (**level ${guild.premiumTier}/3**).` }])

                var button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setURL(guild.iconURL())
                    .setLabel("Server icon")
                    .setStyle(ButtonStyle.Link)
                )

                await interaction.reply({ embeds: [embed], components: [button] });
            };

            async function userInfo()
            {
                var target = interaction.options.getUser("user");
                if (!target) target = interaction.member; // Select the current user if nothing is specified.

                target = guild.members.cache.get(target.id); // Get the user in the server list.
                let userRoles = "";

                target.roles.cache.forEach(role =>
                {
                    if (role.name == "@everyone") return;
                    if (userRoles == "") userRoles = `<@&${role.id}>`;

                    // Update the list.
                    userRoles = `${userRoles}, <@&${role.id}>`;
                });

                db.query("SELECT * FROM warns WHERE guild = ? AND target = ?", [guild.id, target.id], async (err, warns) =>
                {
                    if (err) throw err;

                    db.query("SELECT * FROM xp WHERE guild = ? AND user = ?", [guild.id, target.id], async (err, xp) =>
                    {
                        if (err) throw err;

                        const userXP = xp.length < 1 ? 0 : xp[0].xp;
                        const level = xp.length < 1 ? 0 : xp[0].level;

                        const embed = new EmbedBuilder()
                        .setColor("Gold")
                        .setTitle("Member information:")
                        .setThumbnail(target.user.avatarURL())
                        .setImage(target.user.bannerURL())
                        .addFields([{ name: ":identification_card:・**User**:", value: `>>> **Username**: ${target.user.username}.\n**Pseudo**: ${target.user.globalName}.\n**ID**: ${target.id}.\n**Account Creation**: <t:${Math.floor(target.user.createdAt / 1000)}:F>.\n**Bot**: ${target.user.bot ? "Yes" : "No"}.` }])
                        .addFields([{ name: ":globe_with_meridians:・**Server profile**:", value: `>>> **Pseudo**: ${target.displayName}.\n**Join Date**: <t:${Math.floor(target.joinedAt / 1000) }:F>.\n**Roles**: ${userRoles == "" ? "None" : userRoles}.` }])
                        .addFields([{ name: ":robot:・**Manager stats**:", value: `>>> **Warns Count**: ${warns.length} warns.\n**XP Level**: Level ${level}.\n**XP Points**: ${userXP} points.` }])

                        var button = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(target.user.avatarURL())
                            .setLabel("Profile picture")
                            .setStyle(ButtonStyle.Link)
                        )

                        await interaction.reply({ embeds: [embed], components: [button] });
                    });
                });
            };
        }
        catch (err)
        {
            interaction.reply(`:warning: An unexpected **error** occured!\n\`\`\`${err}\`\`\``);
            console.error(`[error] infos ${interaction.options.getSubcommand()}, ${err}, ${Date.now()}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Information dedicated commands.")
        .addSubcommand(
            cmd => cmd
            .setName("application")
            .setDescription("Application information.")
        ).addSubcommand(
            cmd => cmd
            .setName("emoji")
            .setDescription("Emoji information.")
            .addStringOption(
                opt => opt
                .setName("id")
                .setDescription("Emoji ID.")
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName("role")
            .setDescription("Role information.")
            .addRoleOption(
                opt => opt
                .setName("role")
                .setDescription("Targeted role.")
                .setRequired(true)
            )
        ).addSubcommand(
            cmd => cmd
            .setName("channel")
            .setDescription("Channel information.")
            .addChannelOption(
                opt => opt
                .setName("channel")
                .setDescription("Targeted channel.")
            )
        ).addSubcommand(
            cmd => cmd
            .setName("server")
            .setDescription("Server information.")
        ).addSubcommand(
            cmd => cmd
            .setName("user")
            .setDescription("Member information.")
            .addUserOption(
                opt => opt
                .setName("user")
                .setDescription("Targeted user.")
            )
        )
    }
};