/*!
 * SQL backed session store
 * Copyright(c) 2014 Colin Bookman <cobookman@gmail.com>
 * MIT Licensed
 */

var debug = require("debug")("session:sql");
var knex = require("knex");
var noop = function () {};

/**
 * One day in seconds.
 */
var oneDay = 86400;

/**
 * Return the `SqlStore` extending `express`'s session Store.
 *
 * @param {object} express session
 * @return {Function}
 * @api public
 */

module.exports = function (session) {
  /**
   * Express's session Store.
   */
  var Store = session.Store;

  /**
   * Initialize SqlStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */
  function SqlStore(options) {
    options = options || {};
    this.table = options.table || "sessions";
    this.knex = knex(options);
    if (!this.knex) {
      throw new Error("Invalid database credentials");
    }

    options.expires = options.expires || 1 * 24 * 60 * 60 * 1000; // in ms
    this.expires = options.expires;

    this.ensureTable();

    // call express's session store's constructor
    Store.call(this, options);
  }

  // inherit Express's session store's methods
  SqlStore.prototype = Object.create(Store.prototype);

  SqlStore.prototype._firstRow = function (rows) {
    if (Array.isArray(rows) && rows.length) {
      return rows[0];
    } else {
      return null;
    }
  };

  SqlStore.prototype._calculateExpiration = function (cookie) {
    var expires;
    if (cookie && cookie.expires) {
      expires = cookie.expires;
    } else {
      expires = new Date(Date.now() + this.expires);
    }
    expires = Math.round(expires.getTime() / 1000);
    return expires;
  };

  SqlStore.prototype._hasExpired = function (session) {
    if (!session || !session.expires) {
      return true;
    }

    var currentTime = Date.now() / 1000; //in seconds
    return session.expires < currentTime;
  };

  SqlStore.prototype.get = function (sid, callback) {
    var self = this;
    this.knex
      .select("*")
      .from(this.table)
      .where("session_id", "=", sid)
      .limit(1)
      .then(function (session) {
        session = self._firstRow(session);
        if (!session) {
          debug("No session stored");
          callback(null, null);
        } else if (self._hasExpired(session)) {
          debug("Session expired", session);
          self.destroy(sid);
          callback(null, null);
        } else {
          debug("Grabbed session", session);
          var data = JSON.parse(session.data);
          callback(null, data);
        }
      })
      .catch(function (err) {
        debug("Could not get session from database", err);
        callback(err, null);
      });
  };

  SqlStore.prototype.set = function (sid, data, callback) {
    var self = this;
    var row = {
      session_id: sid,
      expires: this._calculateExpiration(data.cookie),
      data: JSON.stringify(data),
    };

    this.get(sid, function (err, data) {
      var tableRowExists = data && data !== null;
      if (tableRowExists) {
        self._updateRow(row, callback);
      } else {
        self._insertRow(row, callback);
      }
    });
  };

  SqlStore.prototype._updateRow = function (row, callback) {
    this.knex(this.table)
      .where("session_id", "=", row.session_id)
      .update(row)
      .then(function (numEffectRows) {
        debug("Set data through update query", row);
        callback(null, numEffectRows);
      })
      .catch(function (err) {
        debug(err);
        callback(err, null);
      });
  };

  SqlStore.prototype._insertRow = function (row, callback) {
    this.knex
      .insert(row)
      .into(this.table)
      .then(function (insertedIds) {
        debug("Set data through insert query", row);
        callback(null, insertedIds);
      })
      .catch(function (err) {
        debug(err);
        callback(err, null);
      });
  };

  SqlStore.prototype.destroy = function (sid, callback) {
    callback = callback || noop;
    this.knex(this.table)
      .where("session_id", "=", sid)
      .del()
      .then(function (numEffectRows) {
        debug("Deleted session with id %s", sid);
        callback(null, numEffectRows);
      })
      .catch(function (err) {
        debug(err);
        callback(err, null);
      });
  };

  SqlStore.prototype.length = function (callback) {
    var self = this;
    this.knex(this.table)
      .count("* as numRows")
      .then(function (rows) {
        debug("Got the number of sessions currently stored");
        callback(null, self._firstRow(rows).numRows);
      })
      .catch(function (err) {
        debug("Failed to get the length of the number of sessions stored");
        callback(err, null);
      });
  };

  SqlStore.prototype.clearExpiredSession = function (callback) {
    this.knex(this.table)
      .where("expires", "<", Math.round(Date.now() / 1000))
      .del()
      .then(function (numEffectRows) {
        debug("Cleared expired sessions");
        callback(null, numEffectRows);
      })
      .catch(function (err) {
        debug("Failed to clear expired sessions", err);
        callback(err, null);
      });
  };

  SqlStore.prototype.ensureTable = function (callback) {
    var self = this;
    var tablename = this.table;
    callback = callback || noop;
    this.knex.schema
      .hasTable(tablename)
      .catch(function (err) {
        debug("Failed to check if % table exists", tablename);
        callback(err, null);
      })
      .then(function (exists) {
        if (exists) {
          debug("%s table already exists. No need to create", tablename);
          return callback(null, "table exists");
        } else {
          self.knex.schema
            .createTable(tablename, function (t) {
              t.string("session_id", 255).primary();
              t.integer("expires", 11).unsigned().notNullable();
              t.text("data");
            })
            .then(function () {
              debug("Created table: %s", tablename);
              callback(null, "Created table");
            })
            .catch(function (err) {
              debug("Failed to create table: %s", tablename);
              callback(err, null);
            });
        }
      });
  };

  SqlStore.prototype.on = function (event, callback) {
    // TODO - events not supported
  };

  return SqlStore;
};
