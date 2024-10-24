Here is the database configuration.
For each table, you've the SQL array and the SQL command corresponding.

========== "xp" table: ==========
- Array:
+-------+--------------+------+-----+---------+-------+
| Field | Type         | Null | Key | Default | Extra |
+-------+--------------+------+-----+---------+-------+
| user  | varchar(255) | YES  |     | NULL    |       |
| guild | varchar(255) | YES  |     | NULL    |       |
| xp    | varchar(255) | YES  |     | NULL    |       |
| level | varchar(255) | YES  |     | 0       |       |
+-------+--------------+------+-----+---------+-------+
- SQL command:
``` sh
CREATE TABLE xp (
    user VARCHAR(255),
    guild VARCHAR(255),
    xp VARCHAR(255),
    level VARCHAR(255) DEFAULT '0'
);
```

========== "warns" table: ==========
- Array:
+-----------+---------------+------+-----+---------+-------+
| Field     | Type          | Null | Key | Default | Extra |
+-----------+---------------+------+-----+---------+-------+
| guild     | varchar(255)  | YES  |     | NULL    |       |
| warnID    | varchar(255)  | NO   | PRI | NULL    |       |
| target    | varchar(255)  | YES  |     | NULL    |       |
| moderator | varchar(255)  | YES  |     | NULL    |       |
| reason    | varchar(2000) | YES  |     | NULL    |       |
| date      | varchar(255)  | YES  |     | NULL    |       |
+-----------+---------------+------+-----+---------+-------+
- SQL command:
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
- Array:
+---------------------+--------------+------+-----+---------------------+-------+
| Field               | Type         | Null | Key | Default             | Extra |
+---------------------+--------------+------+-----+---------------------+-------+
| guild               | varchar(255) | NO   | PRI | NULL                |       |
| raidmode            | varchar(255) | YES  |     | false               |       |
| antibot             | varchar(255) | YES  |     | true                |       |
| antispam            | varchar(255) | YES  |     | true false 5 5 3 10 |       |
| warn                | varchar(255) | YES  |     | true 3 1            |       |
| youtubeNotification | varchar(255) | YES  |     | NULL                |       |
| memberAdd           | varchar(255) | YES  |     | NULL                |       |
| joinRole            | varchar(255) | YES  |     | NULL                |       |
| memberRemove        | varchar(255) | YES  |     | NULL                |       |
| messagesLogs        | varchar(255) | YES  |     | NULL                |       |
| channelsLogs        | varchar(255) | YES  |     | NULL                |       |
| bansLogs            | varchar(255) | YES  |     | NULL                |       |
+---------------------+--------------+------+-----+---------------------+-------+
- SQL command:
``` sh
CREATE TABLE config (
    guild VARCHAR(255) PRIMARY KEY,
    raidmode VARCHAR(255) DEFAULT 'false',
    antibot VARCHAR(255) DEFAULT 'true',
    antispam VARCHAR(255) DEFAULT 'true false 5 5 3 10',
    warn VARCHAR(255) DEFAULT 'true 3 1',
    youtubeNotification VARCHAR(255) DEFAULT NULL,
    memberAdd VARCHAR(255) DEFAULT NULL,
    joinRole VARCHAR(255) DEFAULT NULL,
    memberRemove VARCHAR(255) DEFAULT NULL,
    messagesLogs VARCHAR(255) DEFAULT NULL,
    channelsLogs VARCHAR(255) DEFAULT NULL,
    bansLogs VARCHAR(255) DEFAULT NULL
);
```