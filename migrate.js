/**
 * Name: dbot-migrate
 * Description: Migrate DBot 0.3 and 0.4-dev data to DBot 0.4.
 */

var _ = require('underscore')._,
    fs = require('fs'),
    async = require('async');

var migrate = function(dbot) {
    this.commands = {
        '~migratequotes': function(event) {
            var oldQuotes = dbot.db.quoteArrs,
                migratedCount = 0;

            if(oldQuotes && _.size(oldQuotes) > 0) {
                event.reply(dbot.t('migrating_quotes', {'num': _.size(oldQuotes)}));

                _.each(oldQuotes, function(quotes, category) {
                    migratedCount += _.size(quotes);
                    async.eachSeries(quotes, function(quote, callback) {
                        dbot.api.quotes.addQuote(category, quote, event.user, function(res) {
                            callback(null);
                        });
                    });
                });

                event.reply(dbot.t('migrated_quotes', {
                    'migrated': migratedCount,
                    'categories': _.size(oldQuotes)
                }));
            } else {
                event.reply(dbot.t('no_old_quotes'));
            }
        },

        '~migrateconfig': function(event) {
            var oldConfig = dbot.db.config,
                modules = fs.readdirSync('modules');

            if(!dbot.config.modules) {
                dbot.config.modules = {};
            }

            if(!_.isUndefined(oldConfig)) {
                _.each(oldConfig, function(item, key) {
                    if(_.include(modules, key)) {
                        dbot.customConfig.modules[key] = item; 
                    } else {
                        dbot.customConfig[key] = item;
                    }
                });
                dbot.modules.admin.internalAPI.saveConfig();
                event.reply(dbot.t('migrated_config', { 'count': 'n/a' }));
            } else {
                event.reply(dbot.t('no_old_config'));
            }
        },

        '~migratepolls': function(event) {
            var oldPolls = dbot.db.polls;
                migratedCount = 0;

            if(oldPolls && oldPolls.length > 0) {
                _.each(oldPolls, function(oldPoll, pollName) {
                    dbot.api.users.resolveUser(event.server, oldPoll.owner, function(user) {
                        dbot.modules.poll.db.create('poll', pollName, {
                            'name': pollName,
                            'description': oldPoll.description,
                            'owner': user.id,
                            'votes': oldPoll.votes,
                            'votees': {}
                        }, function(err, newPoll) {
                            if(!err) {
                                _.each(oldPoll.votees, function(choice, voterNick) {
                                    dbot.api.users.resolveUser(event.server, voterNick, function(user) {
                                        newPoll.votees[user.id] = choice; 
                                    });
                                });
                            } else if(err == AlreadyExistsError) { // Probably anyway
                                event.reply(dbot.t('cannot_migrate_poll_exists', { 'name': pollName })); 
                            }
                        });
                    });
                });
            } else {
                event.reply(dbot.t('no_old_polls'));
            }
        }
    };
};

exports.fetch = function(dbot) {
    return new migrate(dbot);
};
