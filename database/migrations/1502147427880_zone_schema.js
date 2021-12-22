'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ZoneSchema extends Schema {
    up() {
        this.create('zones', (table) => {
            table.increments();
            table.string('name', 80);
            table.timestamps();
            table.engine('innodb');
        });
    }

    down() {
        this.drop('zones');
    }
}

module.exports = ZoneSchema;
