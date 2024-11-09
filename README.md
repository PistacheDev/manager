# Manager
Official Manager source code!
ONLY PistacheDev is allowed to modificate the .gitignore file!

## Important
You can contribute to this project!
You've just to update the program and submit a pull request!

## Required
- Nodejs
- Python (if you want to run some tools like update.py)
- MySQL database.

## Run the application
1) Make sure that your database is correctly configured and running.
2) Ensure that your information in the .env file are correct.
3) Make sure that the config.json file is properly configured.
4) Run the application with Nodejs:
```sh
node main
```

## update.py
The script update.py allows you to update all application dependencies.
You just need to run it and wait until the program has finished.

## Database configuration
Refer to the "DATABASE.md" file to set up the database.
Your database must handle MySQL.

## config.json configuration
The config.json file contains the official debug configuration.
For debugging, you can change these settings but you've to revert to the official ones before submitting a pull request.
If you've edited the config.json, your pull request will be rejected (except if you changed the version setting).

## .env configuration
Create a new file called ".env" in the main folder.
Copy the following text into it and fill in with your information:
``` js
DB_HOST='URL OR IP TO YOUR DATABASE'
DB_DATABASE='DATABASE NAME'
DB_USER='YOUR USERNAME'
DB_PASSWORD='YOUR PASSWORD'
APP_SECRET='DISCORD BOT SECRET'
APP_TOKEN='DISCORD BOT TOKEN'
```