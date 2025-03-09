const jsonwebtoken = require("jsonwebtoken");
const { requestInfo } = require("../functions/discordRequest");
const { client, db } = require("../main");
const { PermissionsBitField } = require("discord.js");
const Perms = PermissionsBitField.Flags;

module.exports =
{
    name: "/dashboard/:id/security/config",
    async run(req, res)
    {
        try
        {
            if (!req.cookies.sessionKey) return res.status(403).redirect("/login"); // Check if the user is logged in.
            if (!req.params.id) return res.status(403).send("Bad request!"); // Check if the required guild ID is provided in the request.

            const accessToken = jsonwebtoken.verify(req.cookies.sessionKey, process.env.ENCRYPTION_KEY); // Decode the access token and verify the signature.
            const userInfo = await requestInfo("https://discord.com/api/users/@me", accessToken.data);

            // Some server verifications.
            const guild = client.guilds.cache.get(req.params.id);
            if (!guild) return res.status(500).send("The application isn't installed on this server!");

            // Some user verifications.
            const member = guild.members.cache.get(userInfo.data.id);
            if (!member) return res.status(403).send("You aren't a member of this server!");
            if (!member.permissions.has(Perms.Administrator) && !member.permissions.has(Perms.ManageGuild) && guild.ownerId != userInfo.data.id) return res.status(403).send("You don't have the required permissions in this server!");

            // Read data.
            const raidmode = req.query.raidmode;
            const autoraidmode = req.query.autoraidmode;
            const messages = req.query.messages;
            const interval = req.query.interval;
            const antibots = req.query.antibots;

            db.query("UPDATE config SET raidmode = ?, autoraidmode = ?, antibots = ? WHERE guild = ?", [raidmode ? 1 : 0, autoraidmode ? `${messages} ${interval}` : 0, antibots ? 1 : 0, guild.id], async (err) =>
            {
                if (err) throw err;
                await res.status(200).redirect(`/dashboard/${guild.id}/security`);
            });
        }
        catch (err)
        {
            res.status(500).send("An unexpected error occured! Please, try again!");
            console.error(`[error] website, configSecurity, ${err}, ${Date.now()}`);
        };
    }
};