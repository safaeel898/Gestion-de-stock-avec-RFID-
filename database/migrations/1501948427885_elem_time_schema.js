'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ElemTimeSchema extends Schema {
    up() {
        this.create('elem_times', (table) => {
            table.increments();
            table.string('repeat_by', 80);
            table.string('day_week', 80);
            table.time('start_hour', 6);
            table.time('end_hour', 6);
            table.engine('innodb');
            table.timestamps();
        });
    }

    down() {
        this.drop('elem_times');
    }
}

module.exports = ElemTimeSchema;
