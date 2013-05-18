## Migrate

Migrate DBot data between versions.

### Description

This module was created to help people running DBot instances to migrate data
stored by various modules between versions of the bot in which the storage
schemas, drivers or otherwise have changed. 

The current version of this module is designed to migrate data from DBot 0.3 and
below, which stores data in a flat JSON file, to 0.4, which uses the DataBank
library to provide a common interface for storing DBot data in various formats
such as redis, flat files etc.

### How To Migrate

To use this module to migrate your data, first update your repository to 0.4 -
as 0.4 is not yet released, you can do this by switching to the database branch
in the DBot development repository like so:

    $ git pull
    $ git checkout database
    $ git submodule update

Then, back up your database file by copying it somewhere while it's being used
in the migration process (the migration commands shouldn't wipe out any data,
but there's no harm in being safe).

    $ cp db.json ../db.json.bak

Now you need to clone this repository into the dbot modules directory to install
the migration module, and then run the bot as normal.

    $ git clone git@github.com:reality/dbot-migrate.git modules/migrate
    $ node run.js

DBot should use your config.json file from your old installation to load some of
the configuration you had before, however any of the configuration you had set
with the 'setconfig' command will not be loaded, as these will have to be
migrated by this module first. 

Now you can load the migrate module, and move onto progressing through the
commands documented below to migrate your data to the new data format.

    > load migrate

### Commands

#### ~migratequotes

