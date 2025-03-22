const { fixMissingConfig } = require("../functions/missingConfig");
const normalizer = require("replace-special-characters");

module.exports =
{
    name: "guildMemberUpdate",
    async run(client, db, oldMember, newMember)
    {
        const guild = oldMember.guild;
        if (!newMember.manageable) return;

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, config) =>
        {
            if (err) throw err;
            let data = config;

            if (config.length < 1) data = await fixMissingConfig(guild);
            if (data[0].autoNormalizer == 0) return;

            const normalized = normalizer(newMember.displayName);
            if (normalized == newMember.displayName) return;

            await newMember.setNickname(normalized);
        });
    }
};