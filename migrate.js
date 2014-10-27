/**
 * Name: dbot-migrate
 * Description: Migrate DBot 0.4 and 0.5-dev (pre-betterusers merge) data to DBot 0.5.
 */

var _ = require('underscore')._,
    fs = require('fs'),
    async = require('async');

var migrate = function(dbot) {
    this.commands = {
        '~fixnotifyids': function(event) {
            // First, update IDs to nick.server
            var notifies = [];
            dbot.modules.report.db.scan('notifies', function(notify) {
                notifies.push(notify); 
            }, function() {
                var updated = 0,
                    deleted = 0;
                async.each(notifies, function(notify, done) {
                    dbot.modules.users.db.read('users', notify.user, function(err, user) {
                        if(user) {
                            notify.user = user.primaryNick + '.' + user.server;
                            dbot.modules.report.db.save('notifies', notify.id, notify, function() {
                                updated++;
                                done(); 
                            });
                        } else {
                            dbot.modules.report.db.del('notifies', notify.id, function() {
                                deleted++;
                                done();
                            });
                        }
                    });
                }, function() {
                    event.reply('Updated ' + updated + ' notify IDs.');
                    event.reply('Deleted ' + deleted + ' broken notifies.');
                });
            });
        },
        
        '~fixprofileids': function(event) {
            // First, update IDs to nick.server
            var profiles = [];
            dbot.modules.profile.db.scan('profiles', function(profile) {
                profiles.push(profile); 
            }, function() {
                var updated = 0,
                    deleted = 0;
                async.each(profiles, function(profile, done) {
                    dbot.modules.users.db.read('users', profile.id, function(err, user) {
                        if(user) {
                            dbot.modules.profile.db.del('profiles', profile.id, function() {
                                profile.id = user.primaryNick + '.' + user.server;
                                dbot.modules.profile.db.save('profiles', profile.id, profile, function() {
                                    updated++;
                                    done(); 
                                });
                            });
                        } else {
                            dbot.modules.profile.db.del('profiles', profile.id, function() {
                                deleted++;
                                done();
                            });
                        }
                    });
                }, function() {
                    event.reply('Updated ' + updated + ' profile IDs.');
                    event.reply('Deleted ' + deleted + ' broken profiles.');
                });
            });
        },

        '~fixwarningids': function(event) {
            // First, update IDs to nick.server
            var warnings = [];
            dbot.modules.warning.db.scan('warnings', function(warning) {
                warnings.push(warning); 
            }, function() {
                var updated = 0,
                    deleted = 0;
                async.each(warnings, function(warning, done) {
                    dbot.modules.users.db.read('users', warning.warner, function(err, warner) {
                        dbot.modules.users.db.read('users', warning.warnee, function(err, warnee) {
                            if(warner && warnee) {
                                warning.warner = warner.primaryNick + '.' + warner.server;
                                warning.warnee = warnee.primaryNick + '.' + warnee.server;
                                dbot.modules.warning.db.save('warnings', warning.id, warning, function() {
                                    updated++;
                                    done(); 
                                });
                            } else {
                                dbot.modules.warning.db.del('warnings', warning.id, function() {
                                    deleted++;
                                    done();
                                });
                            }
                        });
                    });
                }, function() {
                    event.reply('Updated ' + updated + ' warning IDs.');
                    event.reply('Deleted ' + deleted + ' broken warnings.');
                });
            });
        },
        
        '~fixignoreids': function(event) {
            // First, update IDs to nick.server
            var ignores = [];
            dbot.modules.ignore.db.scan('ignores', function(ignore) {
                ignores.push(ignore); 
            }, function() {
                var updated = 0,
                    deleted = 0;
                async.each(ignores, function(ignore, done) {
                    dbot.modules.users.db.read('users', ignore.id, function(err, user) {
                        if(user) {
                            dbot.modules.ignore.db.del('ignores', ignore.id, function() {
                                ignore.id = user.primaryNick + '.' + user.server;
                                dbot.modules.ignore.db.save('ignores', ignore.id, ignore, function() {
                                    updated++;
                                    done(); 
                                });
                            });
                        } else {
                            dbot.modules.ignore.db.del('ignores', ignore.id, function() {
                                deleted++;
                                done();
                            });
                        }
                    });
                }, function() {
                    event.reply('Updated ' + updated + ' ignore IDs.');
                    event.reply('Deleted ' + deleted + ' broken ignores.');
                });
            });
        },

        '~fixusers': function(event) {
            // run this last
            var users = [];
            dbot.modules.users.db.scan('users', function(user) {
                users.push(user);
            }, function() {
                var updated = 0,
                    dupes = 0,
                    aliasCount = 0;
                async.eachSeries(users, function(user, next) {
                    dbot.api.users.resolveUser(user.server, user.primaryNick, function(err, dUser) {
                        if(!dUser) {
                            dbot.modules.users.db.del('users', user.id, function() {
                                dbot.modules.users.internalAPI.createUser(user.server, user.primaryNick, function(err, nUser) {
                                    async.each(user.aliases, function(alias, done) {
                                        dbot.modules.users.internalAPI.createAlias(alias, nUser, function() {
                                            aliasCount++;
                                            done();
                                        });
                                    }, function() {
                                        updated++;
                                        next();
                                    });
                                }); 
                            });
                        } else {
                            dbot.modules.users.db.del('users', user.id, function() {
                                dupes++;
                                next();
                            });
                        }
                    });
                }, function() {
                    event.reply('Migrated ' + updated + ' users.');
                    event.reply('Migrated ' + aliasCount + ' aliases.');
                    event.reply('Deleted ' + dupes + ' duplicate users.');
                });
            });
        }
    };
};

exports.fetch = function(dbot) {
    return new migrate(dbot);
};
