
"use strict";
let assert = require('chai').assert;
let expect = require('chai').expect;
let PostgresUno = require('../lib/postgres-uno');

describe('PostgresUno Tests', function () {
    describe('Static Method Tests', function () {
        it("escapeDoubleQuotes returns the source if not a string", function(done) {
            let obj = {name: 'rob'};
            let newObj = PostgresUno.escapeDoubleQuotes(obj);
            assert.isTrue(Object.is(obj, newObj), 'returned object is an object');
            done();
        });

        it("escapeDoubleQuotes returns the original string if no double quotes", function(done) {
            let source = 'nodoublequotes';
            let target = PostgresUno.escapeDoubleQuotes(source);
            assert.equal(source, target, 'source and target strings are equal');
            done();
        });

        it("escapeDoubleQuotes escapes the string properly", function(done) {
            let source = 'quoted"likethis"';
            let target = PostgresUno.escapeDoubleQuotes(source);
            assert.equal(target, 'quoted\\"likethis\\"', 'source and target strings are equal');
            done();
        });

        it("escapeSingleQuotes returns the source if not a string", function(done) {
            let obj = {name: 'rob'};
            let newObj = PostgresUno.escapeSingleQuotes(obj);
            assert.isTrue(Object.is(obj, newObj), 'returned object is an object');
            done();
        });

        it("escapeSingleQuotes returns the original string if no single quotes", function(done) {
            let source = 'nosinglequotes';
            let target = PostgresUno.escapeSingleQuotes(source);
            assert.equal(source, target, 'source and target strings are equal');
            done();
        });

        it("escapeSingleQuotes escapes the string properly", function(done) {
            let source = 'quoted\'likethis\'';
            let target = PostgresUno.escapeSingleQuotes(source);
            assert.equal(target, "quoted\'\'likethis\'\'", 'source and target strings are equal');
            done();
        });

    });
});