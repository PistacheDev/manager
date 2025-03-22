const { PermissionsBitField, SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports =
{
    name: "roles",
    type: "management",
    permission: PermissionsBitField.Flags.Administrator,
    autocomplete: ["humans", "bots", "everyone"],
    async run(client, db, interaction)
    {
        const role = interaction.options.getRole("role");
        const target = interaction.options.getString("target");

        const guild = interaction.guild;
        const me = guild.members.cache.get(client.user.id);

        if (!guild.roles.cache.get(role.id)) return interaction.reply({ content: ":warning: This role doesn't exist!", flags: MessageFlags.Ephemeral });
        if (!opts.includes(target)) return interaction.reply({ content: ":warning: The target that you entered isn't valid!", flags: MessageFlags.Ephemeral });
        if (interaction.member.roles.highest.comparePositionTo(role) <= 0) return interaction.reply({ content: ":warning: You can't give or remove this role!", flags: MessageFlags.Ephemeral });
        if (me.roles.highest.comparePositionTo(role) <= 0) return interaction.reply({ content: ":warning: I can't give or remove this role!", flags: MessageFlags.Ephemeral });

        switch (interaction.options.getSubcommand())
        {
            case "add":
                addRole();
                break;
            case "remove":
                removeRole();
                break;
            default:
                interaction.reply({ content: ":warning: Command not found!", flags: MessageFlags.Ephemeral });
                break;
        };

        async function addRole()
        {
            interaction.reply({ content: `:hourglass: Please wait.. This operation might take a while.`, flags: MessageFlags.Ephemeral });
            const members = await guild.members.fetch();

            let targets = members;
            let failures = 0;

            if (target == "humans") targets = members.filter(member => !member.user.bot);
            if (target == "bots") targets = members.filter(member => member.user.bot);

            targets.forEach(member =>
            {
                member.roles.add(role).catch(() =>
                {
                    failures++;
                });
            });

            await interaction.channel.send(`:white_check_mark: Hey <@${interaction.member.id}>! The role attributions are done.${failures != 0 ? `\n:warning: ${failures}/${members.length} role attribution(s) have failed.` : ""}`);
        };

        async function removeRole()
        {
            interaction.reply({ content: `:hourglass: Please wait.. This operation might take a while.`, flags: MessageFlags.Ephemeral });
            const members = await guild.members.fetch();

            let targets = members;
            let failures = 0;

            if (target == "humans") targets = members.filter(member => !member.user.bot);
            if (target == "bots") targets = members.filter(member => member.user.bot);

            targets.forEach(member =>
            {
                if (!member.roles.cache.has(role.id)) return;

                member.roles.remove(role).catch(() =>
                {
                    failures++;
                });
            });

            await interaction.channel.send(`:white_check_mark: Hey <@${interaction.member.id}>! The role removals are done.${failures != 0 ? `\n:warning: ${failures}/${members.length} role removal(s) have failed.` : ""}`);
        };
    },
    get data()
    {
        return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Roles dedicated commands.")
        .addSubcommand(cmd => cmd
            .setName("add")
            .setDescription("Add a specific role for a type of members.")
            .addRoleOption(opt => opt
                .setName("role")
                .setDescription("Role to give.")
                .setRequired(true)
            ).addStringOption(opt => opt
                .setName("target")
                .setDescription("The type of members to target (humans, bots or everyone).")
                .setAutocomplete(true)
                .setRequired(true)
            )
        ).addSubcommand(cmd => cmd
            .setName("remove")
            .setDescription("Remove a specific role for a type of members.")
            .addRoleOption(opt => opt
                .setName("role")
                .setDescription("Role to remove.")
                .setRequired(true)
            ).addStringOption(opt => opt
                .setName("target")
                .setDescription("The type of members to target (humans, bots or everyone).")
                .setAutocomplete(true)
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(this.permission);
    }
};