postgres-uno
============

[![Inline docs](http://inch-ci.org/github/wildbillh/postgres-uno.svg?branch=master)](http://inch-ci.org/github/wildbillh/postgres-uno)

Synopsis
---------
The postgres-uno module supplies an ES6 class that provides a single database
connection to a Postgresql server.
This class is an promise-enabled encapsulation of the node-postgres (pg) module.
See the documentation of the node-postgres module for additional features; https://github.com/brianc/node-postgres.

Code Example
-----------
```javascript
let PostgresUno = require ('../lib/postgres-uno');

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

Installation
------------
npm install postgres-uno --save

Documentation
-------------
The class is documented with JSDoc. 
