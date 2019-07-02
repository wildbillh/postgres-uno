"use strict";
// External Modules
const pg = require('pg');
const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');

// Defines
const CRYPTO_ALGORITHM = 'aes-256-ctr';
const SEED = 'X3f18bH!';
const SEED_IV = '!A8cF:8j38D579m10$0F6CDB62CA34CA';

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
     * The parameters to this function can be an object or a string of the form: 'postgresql://user:password@host:port/database' can be passed.
     * @param {object} config - Passes the DB login parameters to the class in object or string form.
     * @param {string} config.host
     * @param {string} config.user
     * @param {string} config.password
     * @param {number} [config.port=5432]
     * @param {string} [config.database=null]
     * @param {string} [config.string=null]
     * @param {boolean} [config.encrypted=false]
     * @param {boolean} [config.encryptedUser=false]
     * @fires PostgresUno#error
     * @fires PostgresUno#warning
     * @fires PostgresUno#connect
     * @returns {Promise}
     * @fulfil
     * @reject {string} - error message
     *
     */
    connect(config) {
        return new Promise ( (resolve, reject) => {
            // Test to see if the client was previously initialized, if so disconnect and reconnect.
            if (this._client) {
                this._emit.warning && this.emit('warning', "Warning: Connect called on live connection. Disconnecting and reconnecting");
                this.disconnect()
                .then(() => {
                    return this._connect(config);
                })
                .then( () => {
                    return resolve();
                })
                .catch( () => {
                    return reject();
                });
            }
            else {
                this._connect(config)
                .then ( () => {
                    return resolve();
                })
                .catch ( (err) => {
                    return reject(err.toString());
                });
            }
        });
    }

    /**
     *  Used to disconnect from the Database. All cleanup procedures should call this.
     *  Typically your node process will not end normally if there is still a connection
     *  open. A disconnect event if emitted on successful call.
     *  @returns {Promise}
     *  @fulfil
     *  @reject {string} - error message
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
     * @returns {Promise}
     * @fulfil { { rows: [{col1: val, col2: val}], fields: ["col1", "col2"], rowCount: Number, command: String} }
     * @reject {string} - error message
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

    // Private methods

    /***
     * @param config
     * @returns {Promise}
     * @private
     */
    _connect(config) {
        return new Promise ( (resolve, reject) => {

            // Make a local copy of the connection info
            let connection = Object.assign({}, config);

            // Decrypt any encrypted values
            connection = PostgresUno._decryptConfigProperties(connection);

            // Get a new client and connect
            this._client = new pg.Client(connection);
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

    // Statics

    /***
     * Checks to see if the pass or username is encrypted. If so, it returns the
     * clear text version.
     * @param config {{
     *     host: string,
     *     user: string,
     *     password: string,
     *     port: number = 5432,
     *     database: string,
     *     encrypted: boolean = false,
     *     encryptedUser: boolean = false
     * }}
     * @returns {{
     *     host: string,
     *     user: string,
     *     password: string,
     *     port: number,
     *     database: string,
     *     encrypted: boolean,
     *     encryptedUser: boolean
     * }}
     * @throws string
     * @private
     */
    static _decryptConfigProperties (config) {

       if (config.encrypted) {
           let decryptMethod = config.password.includes("::") ? PostgresUno.decryptPassIV : PostgresUno.decryptPass;
           config.password = decryptMethod.call(null, config.password);
           config.encrypted = false;
       }

        if (config.encryptedUser) {
            let decryptMethod = config.user.includes("::") ? PostgresUno.decryptPassIV : PostgresUno.decryptPass;
            config.user = decryptMethod.call(null, config.user);
            config.encryptedUser = false;
        }

       return config;
    }

    /**
     * Used to provide a simple decryption algorithm for user and password. This method is deprecated. You should
     * use decryptPassIV instead.
     * @param {string} encryptedPass - Should be an hex encoded, encrypted string.
     * @returns {string} - decoded password
     * @deprecated
     */
    static decryptPass(encryptedPass) {
        let decipher = crypto.createDecipher(CRYPTO_ALGORITHM,SEED);
        let dec = decipher.update(encryptedPass,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }

    /**
     *  Used to provide a simple decryption algorithm for user and password.
     * @param {string} encryptedPass - Should be an hex encoded, encrypted string.
     * @returns {string} - decoded password
     */
    static decryptPassIV (encryptedPass)  {
        let ar = encryptedPass.split('::');
        let iv = Buffer.from(ar[0], 'hex');
        let decipher = crypto.createDecipheriv(CRYPTO_ALGORITHM,SEED_IV, iv);
        let dec = decipher.update(ar[1],'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }

    /**
     * Provides a simple mechanism for the user to encrypt a password. Note this is
     * not a secure mechanism by any means. It just allows the db config to be stored
     * locally without a clear text password. Note: this method is deprecated.
     * @param {string} clearPass
     * @returns {string} - hex encoded, encrypted password
     * @deprecated
     */
    static encryptPass (clearPass) {
        let cipher = crypto.createCipher(CRYPTO_ALGORITHM,SEED);
        let cryptic = cipher.update(clearPass,'utf8','hex');
        cryptic += cipher.final('hex');
        return cryptic;
    }

    /**
     * Provides a simple mechanism for the user to encrypt a password. Note this is
     * not a secure mechanism by any means. It just allows the db config to be stored
     * locally without a clear text password.
     * @param {string} clearPass
     * @returns {string} - hex encoded, encrypted password
     */
    static encryptPassIV (clearPass)  {
        let iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv(CRYPTO_ALGORITHM,SEED_IV, iv);
        let cryptic = cipher.update(clearPass,'utf8','hex');
        cryptic += cipher.final('hex');
        return `${iv.toString('hex')}::${cryptic}`;
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
     * @param {String | null} source
     * @returns {String}
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
     * @param {Number | null} source
     * @returns {Number | String}
     */
    static numberOrNull (source) {
        if (!source) {
            return 'NULL';
        }

        return source;
    }

    // Events

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