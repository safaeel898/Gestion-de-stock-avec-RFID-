'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class Historys_acsSchema extends Schema {
    up() {
        this.create('historys_acs', (table) => {
            table.increments();
            table.datetime('date_time');
            table.integer('user_id', 25);
            table.string('reader_name', 25);
            table.engine('innodb');
            table.timestamps();
        });
    }

    down() {
        this.drop('historys_acs');
    }
}

module.exports = Historys_acsSchema;
