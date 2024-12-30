Here is the database configuration.
For each table, you've the SQL command to properly configure the database.

========== "xp" table: ==========
``` sh
CREATE TABLE xp (
    user VARCHAR(255),
    guild VARCHAR(255),
    xp VARCHAR(255),
    level VARCHAR(255) DEFAULT '0'
);
```

========== "warns" table: ==========
``` sh
CREATE TABLE warns (
    guild VARCHAR(255),
    warnID VARCHAR(255) PRIMARY KEY,
    target VARCHAR(255),
    moderator VARCHAR(255),
    reason VARCHAR(2000),
    date VARCHAR(255)
);
```

========== "config" table: ==========
``` sh
CREATE TABLE config (
    guild VARCHAR(255) PRIMARY KEY,
    raidmode VARCHAR(255) DEFAULT '0',
    autoraidmode VARCHAR(255) DEFAULT '5 5',
    antibots VARCHAR(255) DEFAULT '1',
    antilinks VARCHAR(255) DEFAULT '2',
    antispam VARCHAR(255) DEFAULT '0 5 5 2 10',
    antiswear VARCHAR(255) DEFAULT '0 1 3 60',
    warn VARCHAR(255) DEFAULT '3 1',
    antipings VARCHAR(255) DEFAULT '0 20',
    xp VARCHAR(255) DEFAULT '0',
    xpgoals VARCHAR(255) DEFAULT '0 0 0 0',
    youtube VARCHAR(255) DEFAULT '0',
    twitch VARCHAR(255) DEFAULT '0',
    memberAdd VARCHAR(255) DEFAULT '0',
    joinRole VARCHAR(255) DEFAULT '0',
    memberRemove VARCHAR(255) DEFAULT '0',
    messagesLogs VARCHAR(255) DEFAULT '0',
    channelsLogs VARCHAR(255) DEFAULT '0',
    bansLogs VARCHAR(255) DEFAULT '0'
);
```

========== "bans" table: ==========
``` sh
CREATE TABLE bans (
    guild VARCHAR(255),
    user VARCHAR(255),
    moderator VARCHAR(255),
    reason VARCHAR(2000),
    date VARCHAR(255)
);
```