/**
 * Name: dbot-migrate
 * Description: Migrate DBot 0.4 data to DBot 0.5.
 */

var _.require('underscore');

var migrate = function(dbot) {
    this.commands = {
        '~migratequotes': function(event) {
            var oldQuotes = dbot.db.quoteArrs,
                migratedCount = 0;

            if(oldQuotes && oldQuotes.length > 0) {
                _.each(oldQuotes, function(quote, cat) {
                    dbot.api.quotes.addQuote(cat, quote, event.user, function(res) { });
                    migratedCount++;
                });
                event.reply(dbot.t('migrated_quotes', {
                    'migrated': migratedCount,
                    'categories': oldQuotes.length
                }));
            } else {
                event.reply(dbot.t('no_old_quotes'));
            }
        }
    };
};

exports.fetch = function(dbot) {
    return new migrate(dbot);
};
