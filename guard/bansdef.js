const { db } = require("../main");

async function bansdef(message)
{
    const guild = message.guild;
    const member = message.member;

    db.query("SELECT * FROM bans WHERE guild = ? AND user = ?", [guild.id, member.id], async (err, data) =>
    {
        if (err) throw err;

        if (data.length > 0)
        {
            message.delete();
            member.ban({ reason: "This user has been definitively banned. Run \"/bansdef remove\" to remove it." });
            return true;
        }
        else return false;
    });
};

module.exports =
{
    bansdef
};