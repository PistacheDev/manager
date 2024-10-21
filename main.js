require('dotenv').config(); // Import the .env file.
const { Client, IntentsBitField, Partials, ActivityType } = require('discord.js');
const config = require('./config.json');
const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

// Create a Discord client.
const client = new Client
({
    intents: [ IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildModeration, IntentsBitField.Flags.GuildEmojisAndStickers, IntentsBitField.Flags.GuildIntegrations, IntentsBitField.Flags.GuildWebhooks, IntentsBitField.Flags.GuildInvites, IntentsBitField.Flags.GuildVoiceStates, IntentsBitField.Flags.GuildMessageReactions, IntentsBitField.Flags.GuildMessageTyping, IntentsBitField.Flags.DirectMessages, IntentsBitField.Flags.DirectMessageReactions, IntentsBitField.Flags.DirectMessageTyping, IntentsBitField.Flags.GuildScheduledEvents, IntentsBitField.Flags.GuildPresences, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent ],
    partials: [ Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User ],
    presence:
    {
        activities: [{ name: ``, type: ActivityType.Custom }],
        status: 'online'
    },
});

// Create a pool connection to the database.
const db = mysql.createPool
({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

client.login(process.env.APP_TOKEN); // Login to the Discord bot account.
module.exports.client = client;
module.exports.db = db;

db.getConnection((err, connection) =>
{
    if (err)
    {
        console.error(`[error] Connection to the database failed! Error:\n${err}\nThe process has been killed (database required).`);
        return process.exit(); // Kill the process (the database is required).
    };

    console.log('[debug] Connection to the database created successfully!');
    connection.release();
});

const app = express(); // Create a web server.
app.use(cookieParser());
app.set('etag', false); // Disable etags.
app.use(express.static(`${__dirname}/website`)); // Force express to use the "website" folder only.
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.listen(config.express.port, config.express.host, () => console.log(`[debug] Website hosted at http://${config.express.host}:${config.express.port}.`));

try
{
    const events = fs.readdirSync('./events').filter(files => files.endsWith('.js'));
    const routes = fs.readdirSync('./routes').filter(files => files.endsWith('.js'));

    for (const event of events)
    {
        const script = require(`./events/${event}`);
        if (!script.name || !script.run) continue;

        if (script.once) client.once(script.name, (...args) => script.run(client, db, ...args));
        else client.on(script.name, (...args) => script.run(client, db, ...args));
    };

    // Middleware.
    app.get('*', async (req, res, next) =>
    {
        // If config.express.debug = true, the request always continue (ONLY use for localhost debugging).
        // If config.express.debug = false, the user is forced to visit the site by the domain name.
        if (req.get('host').startsWith(config.express.host) && !config.express.debug) return res.redirect(`https://manager.pistachedev.fr${req.url}`);

        // We create a log only if the request isn't an another file or a sensitive page.
        if (!['.css', '.png', '.js', '.ico'].includes(path.extname(req.url)) && !req.url.startsWith('/callback')) console.log(`[debug] website, ${req.url}, ${req.method}, ${res.statusCode}, ${req.ip}, ${Date.now()}`);
        next();
    });

    for (const route of routes)
    {
        const script = require(`./routes/${route}`);
        if (script.name && script.run) app.get(script.name, script.run); // Add the page to the website.
    };

    // Error 404.
    app.get('*', async (req, res) =>
    {
        if (!['.css', '.png', '.js', '.ico'].includes(path.extname(req.url))) res.redirect('/home?error=404')
    });
}
catch (err)
{
    console.error(`[error] main, ${err}, ${Date.now()}`);
};

function processHandler (err) // Prevent the application from crashing.
{
    if (err.code == 10062) return; // Ignore the "unknown interaction" error.
    console.error(`[error] processHandler, ${err}, ${Date.now()}`);
};

process.on('unhandledRejection', processHandler);
process.on('uncaughtException', processHandler);