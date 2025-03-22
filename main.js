require("dotenv").config();
const { Client, IntentsBitField, Partials, ActivityType } = require("discord.js");
const config = require("./json/config.json");
console.log(`[debug] Currently running in ${config.debug ? "debug" : "release"} mode!`);
const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const client = new Client
({
    intents: [ IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildModeration, IntentsBitField.Flags.GuildExpressions, IntentsBitField.Flags.GuildIntegrations, IntentsBitField.Flags.GuildWebhooks, IntentsBitField.Flags.GuildInvites, IntentsBitField.Flags.GuildVoiceStates, IntentsBitField.Flags.GuildMessageReactions, IntentsBitField.Flags.GuildMessageTyping, IntentsBitField.Flags.DirectMessages, IntentsBitField.Flags.DirectMessageReactions, IntentsBitField.Flags.DirectMessageTyping, IntentsBitField.Flags.GuildScheduledEvents, IntentsBitField.Flags.GuildPresences, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent ],
    partials: [ Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User ],
    presence:
    {
        activities: [{ name: ``, type: ActivityType.Custom }],
        status: "online"
    },
});

const db = mysql.createPool
({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

client.login(process.env.APP_TOKEN);
module.exports.boot = Date.now();
module.exports.client = client;
module.exports.db = db;

db.getConnection((err, connection) =>
{
    if (err)
    {
        console.error(`[error] Connection to the database failed! Error: ${err}\nThe process has been killed (the database is required).`);
        return process.exit();
    };

    if (process.env.DB_HOST != "localhost")
        console.warn("[warn] You are currently using a remote connection for the database! Be careful!");
    
    if (process.env.DB_USER == "root")
    {
        if (!config.debug)
        {
            console.error("[error] You can't use the database's root user in release mode.\nThe process has been killed (security reason).");
            return process.exit();
        }
        else console.warn("[warn] You are currently using the database's root user! Be careful!");
    };
    
    if (process.env.DB_PASSWORD.length < 12)
    {
        if (!config.debug)
        {
            console.error("[error] Your database's password is too weak for the release mode.\nThe process has been killed (security reason).");
            return process.exit();
        }
        else console.warn("[warn] You are currently using a weak password for the database! Be careful!");
    };

    console.log(`[debug] Connection to the database ${process.env.DB_DATABASE} (${process.env.DB_HOST}) created successfully!`);
    connection.release();
});

const app = express();
app.use(cookieParser());
app.set("etag", false);
app.use(express.static(`${__dirname}/website`));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.listen(config.express.port, config.express.host, () => console.log(`[debug] Website hosted at http://${config.express.host}:${config.express.port}.`));

try
{
    const routes = fs.readdirSync("./routes").filter(files => files.endsWith(".js"));
    let routesCount = 0;

    app.get("*", async (req, res, next) =>
    {
        if (req.get("host").startsWith(config.express.host) && !config.debug) return res.redirect(`https://manager.pistachedev.fr${req.url}`); // Enforce the domain name if we are in release mode.
        if (![".css", ".png", ".js", ".ico"].includes(path.extname(req.url)) && !req.url.startsWith("/callback")) console.log(`[middleware] ${req.url}, ${req.method}, ${res.statusCode}, ${req.ip}, ${Date.now()}`); // We create a log only if the request isn't an another file or a sensitive page.
        next();
    });

    for (const route of routes)
    {
        const script = require(`./routes/${route}`);

        if (script.name && script.run)
        {
            app.get(script.name, script.run);
            routesCount++;
        };
    };

    app.get("*", async (req, res) =>
    {
        if (![".css", ".png", ".js", ".ico"].includes(path.extname(req.url))) res.redirect("/home?error=404")
    });

    console.log(`[debug] ${routesCount} website routes were successfully deployed!`);
    const events = fs.readdirSync("./events").filter(files => files.endsWith(".js"));

    for (const event of events)
    {
        const script = require(`./events/${event}`);
        if (!script.name || !script.run) continue;

        if (script.once) client.once(script.name, (...args) => script.run(client, db, ...args));
        else client.on(script.name, (...args) => script.run(client, db, ...args));
    };
}
catch (err)
{
    console.error(`[error] main, ${err}, ${Date.now()}`);
};

function processHandler (err)
{
    if (err.code == 10062 || err.code == 40060) return;
    console.error(`[error] ${err.message}, ${err.code}, ${Date.now()}, ${err.stack}`);
};

process.on("unhandledRejection", processHandler);
process.on("uncaughtException", processHandler);