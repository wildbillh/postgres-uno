postgres-uno
============

[![Build Status](https://travis-ci.org/wildbillh/postgres-uno.svg?branch=master)](https://travis-ci.org/wildbillh/postgres-uno)[![Inline docs](http://inch-ci.org/github/wildbillh/postgres-uno.svg?branch=master)](http://inch-ci.org/github/wildbillh/postgres-uno)[![npm version](https://badge.fury.io/js/postgres-uno.svg)](https://badge.fury.io/js/postges-uno)

Synopsis
---------
The postgres-uno module supplies an ES6 class that provides a single database
connection to a Postgresql server.
This class is an promise-enabled encapsulation of the node-postgres (pg) module.
See the documentation of the node-postgres module for additional features; https://github.com/brianc/node-postgres.

Code Example
-----------
```javascript
let PostgresUno = require ('postgres-uno');

// Define connection objects and strings. Either can be used.
let dbConfigObject = {
    user: 'nodejs-test',
    host: 'localhost',
    port: 5432,
    password: 'nodejs-test',
    database: 'nodejs-test'
};

// Get and instance of the class
let db = new PostgresUno();

db.connect(dbConfigObject)
.then ( () => {
    return db.query("select now() as thedate");
})
.then( (results) => {
    console.log(results.rows);
    // [ anonymous { thedate: 2016-10-31T18:16:24.859Z } ]
    return db.disconnect();
})
.then ( () => {
    console.log('normal exit');
})
.catch ( (err) => {
    console.log(err);
    return db.disconnect();
});
```

Other Features
--------------

The class is also an emitter. The following events can be listened for:
* connect
* disconnect
* error
* query
* results (turned off by default)
* warning

The emitter behavior can be toggled through the emitControl setter. The default value of this object is:
```javascript
    {connect: true, 
    disconnect: true, 
    error: true, 
    query: true, 
    results: false, 
    warning: true} 
```
Installation
------------
npm install postgres-uno --save

Documentation
-------------

<a name="PostgresUno"></a>

## PostgresUno
Class that provides a single database connection to a Postgres server.
This class uses the node-postgres module for it's underlying connection.
The pg.Client property is exposed for those wanting to use advanced features.
All class methods other than the getter above, return a Promise.
See the node-postgres documentation:
[https://github.com/brianc/node-postgres](https://github.com/brianc/node-postgres) for more information.

**Kind**: global class  

* [PostgresUno](#PostgresUno)
    * [new PostgresUno()](#new_PostgresUno_new)
    * _instance_
        * [.pgClient](#PostgresUno+pgClient) ⇒ <code>object</code>
        * [.emitControl](#PostgresUno+emitControl) ⇒ <code>object</code>
        * [.emitControl](#PostgresUno+emitControl)
        * [.connect(config)](#PostgresUno+connect) ⇒ <code>Promise</code>
        * [.disconnect()](#PostgresUno+disconnect) ⇒ <code>Promise</code>
        * [.query(sql)](#PostgresUno+query) ⇒ <code>Promise</code>
        * ["error"](#PostgresUno+event_error)
        * ["warning"](#PostgresUno+event_warning)
        * ["connect"](#PostgresUno+event_connect)
        * ["disconnect"](#PostgresUno+event_disconnect)
        * ["query"](#PostgresUno+event_query)
        * ["results"](#PostgresUno+event_results)
    * _static_
        * ~~[.decryptPass(encryptedPass)](#PostgresUno.decryptPass) ⇒ <code>string</code>~~
        * [.decryptPassIV(encryptedPass)](#PostgresUno.decryptPassIV) ⇒ <code>string</code>
        * ~~[.encryptPass(clearPass)](#PostgresUno.encryptPass) ⇒ <code>string</code>~~
        * [.encryptPassIV(clearPass)](#PostgresUno.encryptPassIV) ⇒ <code>string</code>
        * [.escapeDoubleQuotes(source)](#PostgresUno.escapeDoubleQuotes) ⇒ <code>string</code>
        * [.escapeSingleQuotes(source)](#PostgresUno.escapeSingleQuotes) ⇒ <code>string</code>
        * [.stringOrNull(source)](#PostgresUno.stringOrNull) ⇒ <code>String</code>
        * [.numberOrNull(source)](#PostgresUno.numberOrNull) ⇒ <code>Number</code> \| <code>String</code>

<a name="new_PostgresUno_new"></a>

### new PostgresUno()
Create a new instance of the class.

<a name="PostgresUno+pgClient"></a>

### postgresUno.pgClient ⇒ <code>object</code>
Getter that returns the underlying node-postgres client object.
This is useful for using advanced features of the former module,
not exposed by this class.

**Kind**: instance property of [<code>PostgresUno</code>](#PostgresUno)  
<a name="PostgresUno+emitControl"></a>

### postgresUno.emitControl ⇒ <code>object</code>
Getter that returns the underlying emit control object.
By default all emits other than results, are turned on.

**Kind**: instance property of [<code>PostgresUno</code>](#PostgresUno)  
<a name="PostgresUno+emitControl"></a>

### postgresUno.emitControl
Setter for the emit control object. Be default, emits occur for
connect, disconnect, query and warning (results and error is turned off). For
performance reasons, these can be turned off by the user. Example: to disable query
and results emits only, set the value as such:
{connect: true, disconnect: true, error: true, query: true, results: false, warning: true}

**Kind**: instance property of [<code>PostgresUno</code>](#PostgresUno)  

| Param | Type |
| --- | --- |
| emitObject | <code>object</code> | 

<a name="PostgresUno+connect"></a>

### postgresUno.connect(config) ⇒ <code>Promise</code>
Connect to a server using the provided query string or connect object.
If the connect fails, the method rejects and an error event is emitted.
If connect is called more than once, the new connection will be honored,
but a warning event will be emitted. A connect event is emitted when resolved.
The parameters to this function can be an object or a string of the form: 'postgresql://user:password@host:port/database' can be passed.

**Kind**: instance method of [<code>PostgresUno</code>](#PostgresUno)  
**Emits**: [<code>error</code>](#PostgresUno+event_error), [<code>warning</code>](#PostgresUno+event_warning), [<code>connect</code>](#PostgresUno+event_connect)  
**Fulfil**:   
**Reject**: <code>string</code> - error message  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>object</code> |  | Passes the DB login parameters to the class in object or string form. |
| config.host | <code>string</code> |  |  |
| config.user | <code>string</code> |  |  |
| config.password | <code>string</code> |  |  |
| [config.port] | <code>number</code> | <code>5432</code> |  |
| [config.database] | <code>string</code> | <code>null</code> |  |
| [config.string] | <code>string</code> | <code>null</code> |  |
| [config.encrypted] | <code>boolean</code> | <code>false</code> |  |
| [config.encryptedUser] | <code>boolean</code> | <code>false</code> |  |

<a name="PostgresUno+disconnect"></a>

### postgresUno.disconnect() ⇒ <code>Promise</code>
Used to disconnect from the Database. All cleanup procedures should call this.
 Typically your node process will not end normally if there is still a connection
 open. A disconnect event if emitted on successful call.

**Kind**: instance method of [<code>PostgresUno</code>](#PostgresUno)  
**Emits**: [<code>disconnect</code>](#PostgresUno+event_disconnect)  
**Fulfil**:   
**Reject**: <code>string</code> - error message  
<a name="PostgresUno+query"></a>

### postgresUno.query(sql) ⇒ <code>Promise</code>
Submit sql or ddl to be applied to the server. When resolved, the promise contains
 a results object. The format is documented
 somewhat in the return documentation below. If an error is detected,
 the method rejects and an error event is emitted.
 By default the query event is emitted when this method is called.
 The results event is emitted when the method resolves, but this feature is off by default.

**Kind**: instance method of [<code>PostgresUno</code>](#PostgresUno)  
**Emits**: [<code>error</code>](#PostgresUno+event_error), [<code>query</code>](#PostgresUno+event_query), [<code>results</code>](#PostgresUno+event_results)  
**Fulfil**: <code> { rows: [{col1: val, col2: val</code>], fields: ["col1", "col2"], rowCount: Number, command: String} }  
**Reject**: <code>string</code> - error message  

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>String</code> | Valid SQL or DDL to apply to the DB |

<a name="PostgresUno+event_error"></a>

### "error"
If an error is detected during connect(), disconnect() or query() calls,
the method rejects the promise and an error event is emitted.
It can be useful to listen to this event for easy debugging.

**Kind**: event emitted by [<code>PostgresUno</code>](#PostgresUno)  
<a name="PostgresUno+event_warning"></a>

### "warning"
The warning event is only emitted when the connect method is called more than one time.

**Kind**: event emitted by [<code>PostgresUno</code>](#PostgresUno)  
<a name="PostgresUno+event_connect"></a>

### "connect"
The connect event is only emitted when the connect method resolves.

**Kind**: event emitted by [<code>PostgresUno</code>](#PostgresUno)  
<a name="PostgresUno+event_disconnect"></a>

### "disconnect"
The disconnect event is only emitted when the disconnect method resolves.

**Kind**: event emitted by [<code>PostgresUno</code>](#PostgresUno)  
<a name="PostgresUno+event_query"></a>

### "query"
The query event is emitted when the query method is called, but before the
submission to the db. The object emitted has a Query property containing the sql. This is often
useful for debugging purposes.

**Kind**: event emitted by [<code>PostgresUno</code>](#PostgresUno)  
<a name="PostgresUno+event_results"></a>

### "results"
The results event is emitted when the query method has resolved.
The event contains the results object. This emit is off by default.
Use the emitControl setter to change the value, if desired.

**Kind**: event emitted by [<code>PostgresUno</code>](#PostgresUno)  
<a name="PostgresUno.decryptPass"></a>

### ~~PostgresUno.decryptPass(encryptedPass) ⇒ <code>string</code>~~
***Deprecated***

Used to provide a simple decryption algorithm for user and password. This method is deprecated. You should
use decryptPassIV instead.

**Kind**: static method of [<code>PostgresUno</code>](#PostgresUno)  
**Returns**: <code>string</code> - - decoded password  

| Param | Type | Description |
| --- | --- | --- |
| encryptedPass | <code>string</code> | Should be an hex encoded, encrypted string. |

<a name="PostgresUno.decryptPassIV"></a>

### PostgresUno.decryptPassIV(encryptedPass) ⇒ <code>string</code>
Used to provide a simple decryption algorithm for user and password.

**Kind**: static method of [<code>PostgresUno</code>](#PostgresUno)  
**Returns**: <code>string</code> - - decoded password  

| Param | Type | Description |
| --- | --- | --- |
| encryptedPass | <code>string</code> | Should be an hex encoded, encrypted string. |

<a name="PostgresUno.encryptPass"></a>

### ~~PostgresUno.encryptPass(clearPass) ⇒ <code>string</code>~~
***Deprecated***

Provides a simple mechanism for the user to encrypt a password. Note this is
not a secure mechanism by any means. It just allows the db config to be stored
locally without a clear text password. Note: this method is deprecated.

**Kind**: static method of [<code>PostgresUno</code>](#PostgresUno)  
**Returns**: <code>string</code> - - hex encoded, encrypted password  

| Param | Type |
| --- | --- |
| clearPass | <code>string</code> | 

<a name="PostgresUno.encryptPassIV"></a>

### PostgresUno.encryptPassIV(clearPass) ⇒ <code>string</code>
Provides a simple mechanism for the user to encrypt a password. Note this is
not a secure mechanism by any means. It just allows the db config to be stored
locally without a clear text password.

**Kind**: static method of [<code>PostgresUno</code>](#PostgresUno)  
**Returns**: <code>string</code> - - hex encoded, encrypted password  

| Param | Type |
| --- | --- |
| clearPass | <code>string</code> | 

<a name="PostgresUno.escapeDoubleQuotes"></a>

### PostgresUno.escapeDoubleQuotes(source) ⇒ <code>string</code>
Escape double quotes in the target string.

**Kind**: static method of [<code>PostgresUno</code>](#PostgresUno)  
**Returns**: <code>string</code> - the string with double quotes escaped  

| Param | Type |
| --- | --- |
| source | <code>string</code> | 

<a name="PostgresUno.escapeSingleQuotes"></a>

### PostgresUno.escapeSingleQuotes(source) ⇒ <code>string</code>
Escape single quotes in the target string.

**Kind**: static method of [<code>PostgresUno</code>](#PostgresUno)  
**Returns**: <code>string</code> - the string with single quotes escaped.  

| Param | Type |
| --- | --- |
| source | <code>string</code> | 

<a name="PostgresUno.stringOrNull"></a>

### PostgresUno.stringOrNull(source) ⇒ <code>String</code>
If source is null, return string 'null', Escape single quotes.

**Kind**: static method of [<code>PostgresUno</code>](#PostgresUno)  

| Param | Type |
| --- | --- |
| source | <code>String</code> \| <code>null</code> | 

<a name="PostgresUno.numberOrNull"></a>

### PostgresUno.numberOrNull(source) ⇒ <code>Number</code> \| <code>String</code>
If source is null, return string 'null'.

**Kind**: static method of [<code>PostgresUno</code>](#PostgresUno)  

| Param | Type |
| --- | --- |
| source | <code>Number</code> \| <code>null</code> | 

