postgres-uno
============

[![Inline docs](http://inch-ci.org/github/wildbillh/postgres-uno.svg?branch=master)](http://inch-ci.org/github/wildbillh/postgres-uno)[![npm version](https://badge.fury.io/js/postgres-uno.svg)](https://badge.fury.io/js/postges-uno)

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
The class is documented with JSDoc. 
