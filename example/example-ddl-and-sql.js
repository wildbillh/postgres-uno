

let PostgresUno = require ('../lib/postgres-uno');

// Define connection objects and strings. Either can be used.
let dbConfigObject = {
    user: 'nodejs-test',
    host: 'localhost',
    port: 5432,
    password: 'nodejs-test',
    database: 'nodejs-test'
};

let createTableSql =
    `   create table if not exists public.mytable
        ( name varchar,
          age integer
          )
`;

let truncateSql = `truncate table public.mytable`;

let insertSql = `insert into public.mytable values ('Bill', 29)`;

let selectSql = 'select * from public.mytable';

// Get and instance of the class
let db = new PostgresUno();

db.connect(dbConfigObject)
.then ( () => {
    return db.query(createTableSql);
})
.then( () => {
    return db.query(truncateSql);
})
.then( () => {
    return db.query(insertSql);
})
.then( () => {
    return db.query(selectSql);
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

/* -------------------- output --------------------------------
 [ anonymous { name: 'Bill', age: 29 } ]
 normal exit
 */