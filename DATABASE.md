Here is the database configuration.
For each table, you've the SQL array and the SQL command corresponding to create the table.

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
+---------------+--------------+------+-----+------------+-------+
| Field         | Type         | Null | Key | Default    | Extra |
+---------------+--------------+------+-----+------------+-------+
| guild         | varchar(255) | NO   | PRI | NULL       |       |
| raidmode      | varchar(255) | YES  |     | 0          |       |
| autoraidmode  | varchar(255) | YES  |     | 5 5        |       |
| antibots      | varchar(255) | YES  |     | 1          |       |
| antilinks     | varchar(255) | YES  |     | 2          |       |
| antispam      | varchar(255) | YES  |     | 0 5 5 2 10 |       |
| warn          | varchar(255) | YES  |     | 3 1        |       |
| antipings     | varchar(255) | YES  |     | 0 20       |       |
| xp            | varchar(255) | YES  |     | 0          |       |
| xpgoals       | varchar(255) | YES  |     | 0 0 0 0    |       |
| youtubeNotifs | varchar(255) | YES  |     | 0          |       |
| memberAdd     | varchar(255) | YES  |     | 0          |       |
| joinRole      | varchar(255) | YES  |     | 0          |       |
| memberRemove  | varchar(255) | YES  |     | 0          |       |
| messagesLogs  | varchar(255) | YES  |     | 0          |       |
| channelsLogs  | varchar(255) | YES  |     | 0          |       |
| bansLogs      | varchar(255) | YES  |     | 0          |       |
+---------------+--------------+------+-----+------------+-------+
- SQL command:
``` sh
CREATE TABLE config (
    guild VARCHAR(255) PRIMARY KEY,
    raidmode VARCHAR(255) DEFAULT '0',
    autoraidmode VARCHAR(255) DEFAULT '5 5',
    antibots VARCHAR(255) DEFAULT '1',
    antilinks VARCHAR(255) DEFAULT '2',
    antispam VARCHAR(255) DEFAULT '0 5 5 2 10',
    warn VARCHAR(255) DEFAULT '3 1',
    antipings VARCHAR(255) DEFAULT '0 20',
    xp VARCHAR(255) DEFAULT '0',
    xpgoals VARCHAR(255) DEFAULT '0 0 0 0',
    youtubeNotifs VARCHAR(255) DEFAULT '0',
    memberAdd VARCHAR(255) DEFAULT '0',
    joinRole VARCHAR(255) DEFAULT '0',
    memberRemove VARCHAR(255) DEFAULT '0',
    messagesLogs VARCHAR(255) DEFAULT '0',
    channelsLogs VARCHAR(255) DEFAULT '0',
    bansLogs VARCHAR(255) DEFAULT '0'
);
```