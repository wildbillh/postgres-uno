/**
 * Created by HODGESW on 10/28/2016.
 */

let PostgresUno = require ('../lib/postgres-uno');

// Define connection objects and strings. Either can be used.
let dbConfigObject = {
    user: 'nodejs-test',
    host: 'localhost',
    port: 5432,
    password: PostgresUno.encryptPassIV('nodejs-test'),
    database: 'nodejs-test',
    encrypted: true
};

let dbConfigString = 'postgresql://nodejs-test:nodejs-test@localhost/nodejs-test';

// define logging functions for messages and results. We'll register these as listeners.
let log = (message) => {
    console.log(`logged: ${message}`);
};

let logQuery = (query) => {
    console.log(`logged: ${query.Query}`);
};

// Get and instance of the class
let db = new PostgresUno();


// Set up listeners for all of the emitted events. Notice this is not really necessary
// for normal processing.
db.on('warning', log);
db.on('error', log);
db.on('connect', log);
db.on('query', logQuery);
db.on('disconnect', log);


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
        console.log('in catch');
        console.log(err);
        return db.disconnect();
    });

/*   -------------- output ----------------
 logged: Connected
 select now() as thedate
 [ anonymous { thedate: 2016-10-31T17:01:36.721Z } ]
 logged: Disconnected
 normal exit
 */