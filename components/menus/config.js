const { PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { fixMissingConfig } = require("../../functions/missingConfig");

module.exports =
{
    name: "configMenu",
    permission: PermissionsBitField.Flags.Administrator,
    async run(client, db, interaction)
    {
        try
        {
            const guild = interaction.guild;

            var menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId("configMenu")
                .setPlaceholder("Select a tab.")
                .setOptions([
                    { emoji: "🏡", label: "Home", description: "Return to home.", value: "home" },
                    { emoji: "🛡️", label: "Security", description: "Configure security options.", value: "security" },
                    { emoji: "🔨", label: "Moderation", description: "Configure moderation options.", value: "moderation" },
                    { emoji: "📊", label: "XP", description: "Configure the XP system.", value: "XP" },
                    { emoji: "🖇️", label: "Connections", description: "Configure external connections.", value: "API" },
                    { emoji: "🛬", label: "Members", description: "Configure arrivals/departures.", value: "members" },
                    { emoji: "📁", label: "Logs", description: "Configure logs.", value: "logs" },
                    { emoji: "❌", label: "Close", description: "Close the configuration panel.", value: "close" }
                ])
            )

            let embed = new EmbedBuilder()
            .setColor("Orange")
            .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
            .setDescription("Press the button with the **emoji corresponding** to **the option** you want to modify.")
            .setThumbnail(client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() })

            db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
            {
                if (err) throw err;
                let data = config;
                if (config.length < 1) data = await fixMissingConfig(guild);

                switch (interaction.values.toString())
                {
                    case "home":
                        homeMenu();
                        break;
                    case "security":
                        securityMenu(data[0]);
                        break;
                    case "moderation":
                        moderationMenu(data[0]);
                        break;
                    case "XP":
                        xpMenu(data[0]);
                        break;
                    case "API":
                        apiMenu(data[0]);
                        break;
                    case "members":
                        membersMenu(data[0]);
                        break;
                    case "logs":
                        logsMenu(data[0]);
                        break;
                    case "close":
                        interaction.message.delete();
                        break;
                    default:
                        interaction.reply(":warning: Unknown **tab**!");
                        break;
                };

                interaction.deferUpdate();
            });

            async function homeMenu()
            {
                const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: "Configuration Panel", iconURL: client.user.avatarURL() })
                .setThumbnail(client.user.avatarURL())
                .setDescription("Configure the application with **its configuration panel**. Through the different tabs, you will find all the **configurable options** of Manager.\n\n➜ When you are in a **configuration tab**, press the button with the **emoji corresponding** to **the option** you want to modify.\nSome options has **several steps** to **properly configure** them.")
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })

                await interaction.message.edit({ embeds: [embed], components: [menu, button] });
            };

            async function securityMenu(data)
            {
                const raidmode = data.raidmode;
                const auto = data.autoraidmode;
                const antibots = data.antibots;

                embed.addFields([{ name: ":closed_lock_with_key:・Raidmode:", value: `➜ ${raidmode == 1 ? ":green_circle:" : ":red_circle:"} Blocks the arrival of **new members** on the server.` }])
                embed.addFields([{ name: ":crossed_swords:・Auto raidmode:", value: `➜ ${auto != 0 ? ":green_circle:" : ":red_circle:"} Enable the **raidmode** when **${auto == 0 ? "too many users" : `more than ${auto.split(" ")[0]} users`}** join the server in ${auto == 0 ? "a **short period** of time" : `less than **${auto.split(" ")[1]} seconds**`}.` }])
                embed.addFields([{ name: ":robot:・Anti bots:", value: `➜ ${antibots == 1 ? ":green_circle:" : ":red_circle:"} Blocks the **addition of applications**, except if it has been added by the **server owner**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("raidmodeButton")
                    .setEmoji("🔐")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("autoraidmodeButton")
                    .setEmoji("⚔️")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("antibotButton")
                    .setEmoji("🤖")
                    .setStyle(ButtonStyle.Secondary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function moderationMenu(data)
            {
                const antispam = data.antispam;
                const antiswear = data.antiswear;
                const warn = data.warn;
                const antipings = data.antipings;
                const antilinks = data.antilinks;

                embed.addFields([{ name: ":hand_splayed:・Anti spam:", value: `➜ ${antispam == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from sending **${antispam == 0 ? "too many messages" : `more than ${antispam.split(" ")[1]} messages`}** in **${antispam == 0 ? "a short period of time" : `less than ${antispam.split(" ")[2]} seconds`}** by warning them. After **${antispam == 0 ? "the maximum configured amount of" : antispam.split(" ")[3]} warns** reached, the member will **${antispam == 0 ? "receive a sanction" : `be ${antispam.split(" ")[4] == "ban" ? "banned" : `muted for ${antispam.split(" ")[4]} minutes`}`}**. The bots **${antispam == 0 ? "can be ignored (*not recommended*)" : `${antispam.split(" ")[0] == 0 ? "aren't ignored" : "are ignored"}`}**.` }])
                embed.addFields([{ name: ":no_entry:・Anti swear:", value: `➜ ${antiswear == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using bad words** by warning them. After **${antiswear == 0 ? "the maximum configured amount of" : antiswear.split(" ")[2]} warns** reached, the member will **${antiswear == 0 ? "receive a sanction" : `be ${antiswear.split(" ")[3] == "ban" ? "banned" : `muted for ${antiswear.split(" ")[3]} minutes`}`}**. The bots **${antiswear == 0 ? "can be" : antiswear.split(" ")[0] == 0 ? "aren't" : "are"} ignored** and the administrators **${antiswear == 0 ? "too" : antiswear.split(" ")[1] == 0 ? "aren't ignored" : "are ignored"}**.` }])
                embed.addFields([{ name: ":warning:・Warns:", value: `➜ ${warn == 0 ? ":red_circle:" : ":green_circle:"} The member **will be ${warn == 0 ? "sanctionned" : warn.split(" ")[1] == "ban" ? "banned" : `muted for ${warn.split(" ")[1]} hours`}** if its warns count reaches **${warn == 0 ? "the maximum amount" : `more than ${warn.split(" ")[0]} warns`}**.` }])
                embed.addFields([{ name: ":loud_sound:・Anti pings:", value: `➜ ${antipings == 0 ? ":red_circle:" : ":green_circle:"} Prevent the members from **using the everyone and here mentions** by **deleting the message** and **${antipings == 0 ? "sanctioning them" : antipings.split(" ")[1] == "ban" ? "banning them" : `muting them for ${antipings.split(" ")[1]} minutes`}**. The bots **${antipings == 0 ? "can be ignored (*not recommended*)" : antipings.split(" ")[0] == 0 ? "aren't ignored" : "are ignored"}**.` }])
                embed.addFields([{ name: ":globe_with_meridians:・Anti links:", value: `➜ ${antilinks == 0 ? ":red_circle:" : antilinks == 1 ? ":yellow_circle:" : ":green_circle:"} Delete the messages **containing links**. The bots ${antilinks == 0 ? "can be" : antilinks == 1 ? "are" : "aren't"} ignored.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("antispamButton")
                    .setEmoji("🖐️")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("antiswearButton")
                    .setEmoji("⛔")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("warnButton")
                    .setEmoji("⚠️")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("antipingsButton")
                    .setEmoji("🔊")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("antilinksButton")
                    .setEmoji("🌐")
                    .setStyle(ButtonStyle.Secondary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function xpMenu(data)
            {
                const xp = data.xp;
                let goals = 0;

                for (let i = 0; i < 10; i++)
                {
                    const goal = data.xpgoals.split(" ")[i];
                    if (goal == 0) goals++; // Calculate the empty goals.
                };

                embed.addFields([{ name: ":gear:・XP system:", value: `➜ ${xp == 0 ? ":red_circle:" : ":green_circle:"} Gives XP points to the members per **each message sent**, **between 1** and **${xp == 0 ? "the maximum amount of XP points configured" : `${xp.split(" ")[1]} XP points`}**. Each time the members pass the **goal to level up**, their level **increases by 1**. The maximum level is **${xp == 0 ? "the configured level" : `the level ${xp.split(" ")[2]}`}**. The members **${xp == 0 ? "can be" : xp.split(" ")[0] == 1 ? "are" : "aren't"} notified** when they level up.` }])
                embed.addFields([{ name: ":trophy:・Goals:", value: `➜ ${xp == 0 ? ":red_circle:" : goals == 10 ? ":yellow_circle:" : ":green_circle:"} When a member **reaches a certain level**, the application **gives a role** to this member. Yet, **${goals == 10 ? "no roles have been configured" : `it remains ${goals} roles configurable available`}**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("xpSettingsButton")
                    .setEmoji("⚙️")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("xpGoalsButton")
                    .setEmoji("🏆")
                    .setStyle(ButtonStyle.Secondary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function apiMenu(data)
            {
                const yt = data.youtube;
                const twitch = data.twitch;

                embed.addFields([{ name: ":video_camera:・YouTube Notifications:", value: `➜ ${yt == 0 ? ":red_circle:" : yt.split(" ")[1] == 0 ? ":yellow_circle:" : ":green_circle:"} **Sends a message** in ${yt == 0 ? "the **configured channel**" : `<#${yt.split(" ")[0]}>`} mentioning ${yt == 0 ? "the **configured role**" : yt.split(" ")[1] == 0 ? "the **future role** (setup to complete)" : yt.split(" ")[1] == "@everyone" ? "@everyone" : `<@&${yt.split(" ")[1]}>`} when ${yt == 0 ? "the **configured YouTube channel**" : yt.split(" ")[1] == 0 ? "the **future YouTube channel**" : `**${yt.split(" ")[2]}**`} releases a **new video**.` }])
                embed.addFields([{ name: ":television:・Twitch Notifications:", value: `➜ ${twitch == 0 ? ":red_circle:" : twitch.split(" ")[1] == 0 ? ":yellow_circle:" : ":green_circle:"} **Sends a message** in ${twitch == 0 ? "the **configured channel**" : `<#${twitch.split(" ")[0]}>`} mentioning ${twitch == 0 ? "the **configured role**" : twitch.split(" ")[1] == 0 ? "the **future role** (setup to complete)" : twitch.split(" ")[1] == "@everyone" ? "@everyone" : `<@&${twitch.split(" ")[1]}>`} when ${twitch == 0 ? "the **configured Twitch channel**" : twitch.split(" ")[1] == 0 ? "the **future Twitch channel**" : `**${twitch.split(" ")[2]}**`} goes to **live**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("youtubeButton")
                    .setEmoji("📹")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("twitchButton")
                    .setEmoji("📺")
                    .setStyle(ButtonStyle.Secondary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function membersMenu(data)
            {
                const memberAdd = data.memberAdd;
                const role = data.joinRole;
                const memberRemove = data.memberRemove;

                embed.addFields([{ name: ":airplane_arriving:・Arrival Messages:", value: `➜ ${memberAdd == 0 ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${memberAdd == 0 ? "the **configured channel**" : `<#${memberAdd}>`} when a user **joins the server**.` }])
                embed.addFields([{ name: ":envelope_with_arrow:・Arrival Role:", value: `➜ ${role == 0 ? ":red_circle:" : ":green_circle:"} **Assigns ${role == 0 ? "a role" : `<@&${role}>`}** to the new arrived users.` }])
                embed.addFields([{ name: ":airplane_departure:・Departure Messages:", value: `➜ ${memberRemove == 0 ? ":red_circle:" : ":green_circle:"} **Sends a message** in ${memberRemove == 0 ? "the **configured channel**" : `<#${memberRemove}>`} when a user **leaves the server**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("memberAddButton")
                    .setEmoji("🛬")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("arrivalRoleButton")
                    .setEmoji("📩")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("memberRemoveButton")
                    .setEmoji("🛫")
                    .setStyle(ButtonStyle.Secondary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };

            async function logsMenu(data)
            {
                const messagesLogs = data.messagesLogs;
                const channelsLogs = data.channelsLogs;
                const bansLogs = data.bansLogs;

                embed.addFields([{ name: ":speech_balloon:・Messages Logs:", value: `➜ ${messagesLogs == 0 ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${messagesLogs == 0 ? "the **configured channel**" : `<#${messagesLogs}>`} when a message is **deleted** or **edited**.` }])
                embed.addFields([{ name: ":keyboard:・Channels Logs:", value: `➜ ${channelsLogs == 0 ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${channelsLogs == 0 ? "the **configured channel**" : `<#${channelsLogs}>`} when a channel is **created**, **deleted**, or **edited**.` }])
                embed.addFields([{ name: ":scales:・Bans Logs:", value: `➜ ${bansLogs == 0 ? ":red_circle:" : ":green_circle:"} **Sends a log** in ${bansLogs == 0 ? "the **configured channel**" : `<#${bansLogs}>`} when a ban is **issued** or **revoked**.` }])

                var buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("messagesLogsButton")
                    .setEmoji("💬")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("channelsLogsButton")
                    .setEmoji("⌨️")
                    .setStyle(ButtonStyle.Secondary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId("bansLogsButton")
                    .setEmoji("⚖️")
                    .setStyle(ButtonStyle.Secondary)
                )

                await interaction.message.edit({ embeds: [embed], components: [buttons, menu] });
            };
        }
        catch (err)
        {
            interaction.reply({ content: ":warning: An unexpected **error** occured!", ephemeral: true });
            console.error(`[error] configMenu, ${err}, ${Date.now()}`);
        };
    }
};