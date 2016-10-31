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

/* --------------------- output -----------------------
 [ anonymous { thedate: 2016-10-31T17:25:42.681Z } ]
 normal exit
 */
