'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ReaderSchema extends Schema {
    up() {
        this.create('readers', (table) => {
            table.increments();
            table.string('reader_name', 80);
            table.string('id_address', 80);
            table.string('port', 80);
            table.integer('zone_id', 25).unsigned().references('id').inTable('zones').onDelete('CASCADE');
            table.engine('innodb');
            table.timestamps();
        });
    }

    down() {
        this.drop('readers');
    }
}

module.exports = ReaderSchema;
