/**
 * Module dependencies.
 */
var format = require('util').format
    , isArray = require('util').isArray
    , redis = require('redis')
    , _ = require('lodash')
    , async = require('async')
    , app;


/**
 * Expose `flash()` function on requests.
 *
 * @return {Function}
 * @api public
 */
module.exports = function flash(options) {
    options = options || {};
    app = options.app || {};
    redis = redis.createClient(options.port || 6379, options.host || 'localhost');
    var safe = (options.unsafe === undefined) ? true : !options.unsafe;

    return function(req, res, next) {
        if (req.flash && safe) { return next(); }
        req.flash = _flash;
        next();
    }
}

/**
 * Queue flash `msg` of the given `type`.
 *
 * Examples:
 *
 *      req.flash('info', 'email sent');
 *      req.flash('error', 'email delivery failed');
 *      req.flash('info', 'email re-sent');
 *      // => 2
 *
 *      req.flash('info');
 *      // => ['email sent', 'email re-sent']
 *
 *      req.flash('info');
 *      // => []
 *
 *      req.flash();
 *      // => { error: ['email delivery failed'], info: [] }
 *
 * Formatting:
 *
 * Flash notifications also support arbitrary formatting support.
 * For example you may pass variable arguments to `req.flash()`
 * and use the %s specifier to be replaced by the associated argument:
 *
 *     req.flash('info', 'email has been sent to %s.', userName);
 *
 * Formatting uses `util.format()`, which is available on Node 0.6+.
 *
 * @param {String} type
 * @param {String} msg
 * @return {Array|Object|Number}
 * @api public
 */
function _flash(type, msg) {

    var sessionId = app.locals.__csrf;

    async.parallel([
        function(cb) {
            if (_.isString(type) && _.isString(msg))  {
                // Both sounds good.
                redis.hset(sessionId, type, msg, function(err, data) {
                    cb(err, data);
                });
            } else if (_.isString(type) && !msg) {
                // Get the message.
                redis.hget(sessionId, type, function(err, data) {
                    redis.hdel(sessionId, type, function() {
                        cb(err, data);
                    });
                });
            } else {
                redis.hgetall(sessionId, function(err, data) {
                    redis.del(sessionId, function() {
                        cb(err, data);
                    });
                });
            }
        }
    ], function(err, results) {
        if (_.isFunction(type)) {
            return type(results.shift());
        }

        return results.shift();
    });
}
