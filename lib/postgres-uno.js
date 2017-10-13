"use strict";

let pg = require('pg');
const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');

/**
 *
 * @class
 * Class that provides a single database connection to a Postgres server.
 * This class uses the node-postgres module for it's underlying connection.
 * The pg.Client property is exposed for those wanting to use advanced features.
 * All class methods other than the getter above, return a Promise.
 * See the node-postgres documentation:
 * {@link https://github.com/brianc/node-postgres} for more information.
 *
 */

class PostgresUno extends EventEmitter{
    /**
     * Create a new instance of the class.
     *@constructor
     */
    constructor () {
        super();
        this._client = null;
        // This object controls which events are emitted.
        this._emit = {
            connect: true,
            disconnect: true,
            error: false,
            query: true,
            results: false,
            warning: true
        };
    }

    /**
     * Connect to a server using the provided query string or connect object.
     * If the connect fails, the method rejects and an error event is emitted.
     * If connect is called more than once, the new connection will be honored,
     * but a warning event will be emitted. A connect event is emitted when resolved.
     * @param {object | string} connectionConfig - Passes the DB login parameters to the class.
     * Can be an object or valid Postgres JDBC connection String
     * @param {string} connectionConfig.host
     * @param {string} connectionConfig.user
     * @param {string} connectionConfig.password
     * @param {number} [connectionConfig.port=5432]
     * @param {string} [connectionConfig.database]
     * @param {string} connectionConfig.string
     * Instead of an object, a String of the form: 'postgresql://user:password@host:port/database' can be passed.
     * @fires PostgresUno#error
     * @fires PostgresUno#warning
     * @fires PostgresUno#connect
     * @returns {Promise} if resolved, then connect was successful, else reject contains error string.
     */
    connect(connectionConfig) {
        return new Promise ( (resolve, reject) => {
            // Test to see if the client was previously initialized, if so disconnect and reconnect.
            if (this._client) {
                this._emit.warning && this.emit('warning', "Warning: Connect called on live connection. Disconnecting and reconnecting");
                this.disconnect()
                .then(() => {
                    return this._connect(connectionConfig);
                })
                .then( () => {
                    return resolve();
                })
                .catch( () => {
                    return reject();
                });
            }
            else {
                this._connect(connectionConfig)
                .then ( () => {
                    return resolve();
                })
                .catch ( (err) => {
                    return reject(err.toString());
                });
            }
        });

    }

    /***
     * @param connectionConfig
     * @returns {Promise}
     * @private
     */
    _connect(connectionConfig) {
        return new Promise ( (resolve, reject) => {
            if (connectionConfig.encrypted) {
                connectionConfig.password = PostgresUno._decryptPass(connectionConfig.password)
            }
            this._client = new pg.Client(connectionConfig);
            this._client.connect( (err) => {
                if (err) {
                    this._emit.error && this.emit('error', err.toString());
                    return reject(err.toString());
                }
                // Allow error messages to go back to the user
                this._emit.connect && this.emit('connect', 'Connected');
                return resolve();
            });

        });
    }


    static _decryptPass(encryptedPass) {
        let algorithm = 'aes-256-ctr',
            password = 'X3f18bH!';
        let decipher = crypto.createDecipher(algorithm,password);
        let dec = decipher.update(encryptedPass,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }

    /**
     * Escape double quotes in the target string.
     * @param {string} source
     * @returns {string} the string with double quotes escaped
     */
    static escapeDoubleQuotes (source) {
        return (typeof source === 'string') ? source.replace(/"/g, '\\"') : source;
    }

    /**
     * Escape single quotes in the target string.
     * @param {string} source
     * @returns {string} the string with single quotes escaped.
     */
    static escapeSingleQuotes (source) {
        return (typeof source === 'string') ? source.replace(/'/g, "''") : source;
    }

    /**
     * If source is null, return string 'null', Escape single quotes.
     * @param source
     * @returns {*}
     */
    static stringOrNull (source) {
        if (!source) {
            return 'NULL';
        }
        else if (typeof source === 'string') {
            return `'${source.replace(/'/g, "''")}'`;
        }
        return source;
    }

    /**
     * If source is null, return string 'null'.
     * @param source
     * @returns {*}
     */
    static numberOrNull (source) {
        if (!source) {
            return 'NULL';
        }
        return source;
    }


    /**
     *  Submit sql or ddl to be applied to the server. When resolved, the promise contains
     *  a results object. The format is documented
     *  somewhat in the return documentation below. If an error is detected,
     *  the method rejects and an error event is emitted.
     *  By default the query event is emitted when this method is called.
     *  The results event is emitted when the method resolves, but this feature is off by default.
     * @param sql {String} Valid SQL or DDL to apply to the DB
     * @fires PostgresUno#error
     * @fires PostgresUno#query
     * @fires PostgresUno#results
     * @returns {Promise} - On success, the promise will be resolved and a data object will be
     * returned. The promise will be rejected and an error message returned on error.
     * @returns {Object} results - The returned data object.
     * @returns {String} results.command - The type of query submitted: 'SELECT', 'UPDATE', etc.
     * @returns {Number} results.rowCount - The number of rows returned.
     * @returns {Array} results.fields - An Array of Objects describing the columns returned. Usefull
     * properties are name, columnID, format ... ect.
     * @returns {Array} results.rows - An Array of Objects equal to the size of rowCount above. Each
     * object contains properties matching the return column names.
     */
    query (sql) {
        return new Promise ( (resolve, reject) => {
            if (!this._client) {
                return reject('client is not connected');
            }

            this._emit.query && this.emit('query', {Query: sql});
            this._client.query(sql, (err, results) => {
                if (err) {
                    this._emit.error && this.emit('error', err.toString());
                    return reject(err.toString());
                }
                else {
                    this._emit.results && this.emit('results', results);
                    return resolve(results);
                }
            })
        });
    }

    /**
     *  Used to disconnect from the Database. All cleanup procedures should call this.
     *  Typically your node process will not end normally if there is still a connection
     *  open. A disconnect event if emitted on successful call.
     *  @fires PostgresUno#disconnect
     */
    disconnect () {
        return new Promise ( (resolve, reject) => {
            if (!this._client) {return resolve();}
            this._client.end( (err) => {
                if (err) {
                    this._emit.error && this.emit('error', err.toString());
                    return reject(err);
                }
                else {
                    this._emit.disconnect && this.emit('disconnect', 'Disconnected');
                    this._client = null;
                    return resolve();
                }
            });

        });
    }

    /**
     * If an error is detected during connect(), disconnect() or query() calls,
     * the method rejects the promise and an error event is emitted.
     * It can be useful to listen to this event for easy debugging.
     * @event PostgresUno#error
     * @type {string}
     *
     */

    /**
     * The warning event is only emitted when the connect method is called more than one time.
     * @event PostgresUno#warning
     * @type {string}
     *
     */

    /**
     * The connect event is only emitted when the connect method resolves.
     * @event PostgresUno#connect
     * @type {string}
     *
     */

    /**
     * The disconnect event is only emitted when the disconnect method resolves.
     * @event PostgresUno#disconnect
     * @type {string}
     *
     */

    /**
     * The query event is emitted when the query method is called, but before the
     * submission to the db. The object emitted has a Query property containing the sql. This is often
     * useful for debugging purposes.
     * @event PostgresUno#query
     * @type {object}
     *
     */

    /**
     * The results event is emitted when the query method has resolved.
     * The event contains the results object. This emit is off by default.
     * Use the emitControl setter to change the value, if desired.
     * @event PostgresUno#results
     * @type {object}
     *
     */


    /**
     * Getter that returns the underlying node-postgres client object.
     * This is useful for using advanced features of the former module,
     * not exposed by this class.
     * @returns {object}
     */
    get pgClient() {
        return this._client;
    }

    /**
     * Getter that returns the underlying emit control object.
     * By default all emits other than results, are turned on.
     * @returns {object}
     */
    get emitControl() {
        return this._emit;
    }

    /**
     * Setter for the emit control object. Be default, emits occur for
     * connect, disconnect, query and warning (results and error is turned off). For
     * performance reasons, these can be turned off by the user. Example: to disable query
     * and results emits only, set the value as such:
     * {connect: true, disconnect: true, error: true, query: true, results: false, warning: true}
     * @param {object} emitObject
     */
    set emitControl (emitObject) {
        this._emit = emitObject;
    }

}

module.exports = PostgresUno;