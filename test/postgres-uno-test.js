
"use strict";

// External Modules
const chai = require('chai');
const {assert} = chai;
chai.use(require("chai-as-promised"));
const sinon = require('sinon');
const pg = require('pg');

// Internal Modules
let PostgresUno = require('../lib/postgres-uno');

describe('PostgresUno Tests', function () {
    describe('Static Method Tests', function () {
        it("escapeDoubleQuotes returns the source if not a string", function() {
            let obj = {name: 'rob'};
            let newObj = PostgresUno.escapeDoubleQuotes(obj);
            assert.isTrue(Object.is(obj, newObj), 'returned object is an object');
        });

        it("escapeDoubleQuotes returns the original string if no double quotes", function() {
            let source = 'nodoublequotes';
            let target = PostgresUno.escapeDoubleQuotes(source);
            assert.equal(source, target, 'source and target strings are equal');
        });

        it("escapeDoubleQuotes escapes the string properly", function() {
            let source = 'quoted"likethis"';
            let target = PostgresUno.escapeDoubleQuotes(source);
            assert.equal(target, 'quoted\\"likethis\\"', 'source and target strings are equal');
        });

        it("escapeSingleQuotes returns the source if not a string", function() {
            let obj = {name: 'rob'};
            let newObj = PostgresUno.escapeSingleQuotes(obj);
            assert.isTrue(Object.is(obj, newObj), 'returned object is an object');
        });

        it("escapeSingleQuotes returns the original string if no single quotes", function() {
            let source = 'nosinglequotes';
            let target = PostgresUno.escapeSingleQuotes(source);
            assert.equal(source, target, 'source and target strings are equal');
        });

        it("escapeSingleQuotes escapes the string properly", function() {
            let source = 'quoted\'likethis\'';
            let target = PostgresUno.escapeSingleQuotes(source);
            assert.equal(target, "quoted\'\'likethis\'\'", 'source and target strings are equal');
        });

        it(`stringOrNull returns the string "NULL" when passed null or undefined`, function() {
            assert.equal(PostgresUno.stringOrNull(null), "NULL");
        });

        it(`stringOrNull returns the string with single quotes escaped`, function() {
            assert.equal(PostgresUno.stringOrNull(`can't`), `'can''t'`);
        });

        it(`numberOrNull returns the string 'NULL' if null or undefined`, function() {
            assert.equal(PostgresUno.numberOrNull(null), `NULL`);
        });

        it(`numberOrNull returns the passed value if defined`, function() {
            assert.equal(PostgresUno.numberOrNull(5), 5);
        });

        it("encryptPass and decryptPass encode and decode the string properly", function() {
            let clearPass = 'mypassword';
            let encPass = PostgresUno.encryptPass(clearPass);
            assert.equal(PostgresUno.decryptPass(encPass), clearPass);
        });

        it("encryptPassIV and decryptPassIV encode and decode the string properly", function() {
            let clearPass = 'mypassword';
            let encPass = PostgresUno.encryptPassIV(clearPass);
            assert.equal(PostgresUno.decryptPassIV(encPass), clearPass);
        });

        it("the proper decode algorithm is detected and applied to the user and/or password", function() {
            let clearUser = "clearUser",
                clearPass = 'clearPass';

            let config = {
                encrypted: true,
                password: PostgresUno.encryptPass(clearPass),
                encryptedUser: true,
                user: PostgresUno.encryptPass(clearUser)
            };
            assert.deepEqual(PostgresUno._decryptConfigProperties(config), {
                encrypted: false,
                password: clearPass,
                encryptedUser: false,
                user: clearUser });

            config = {
                encrypted: true,
                password: PostgresUno.encryptPassIV(clearPass),
                encryptedUser: true,
                user: PostgresUno.encryptPassIV(clearUser)
            };
            assert.deepEqual(PostgresUno._decryptConfigProperties(config), {
                encrypted: false,
                password: clearPass,
                encryptedUser: false,
                user: clearUser });
        });

    });
});