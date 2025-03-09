const normalizer = require("replace-special-characters");

module.exports =
{
    name: "guildMemberUpdate",
    async run(client, db, oldMember, newMember)
    {
        const guild = oldMember.guild;

        db.query("SELECT * FROM config WHERE guild = ?", [guild.id], async (err, data) =>
        {
            if (err) throw err;
            if (data.length < 1 || data[0].autoNormalizer == 0 || !newMember.manageable) return;

            const normalized = normalizer(newMember.displayName);
            if (normalized == newMember.displayName) return;
            await newMember.setNickname(normalized);
        });
    }
};