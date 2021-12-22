'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class GroupAccessSchema extends Schema {
    up() {
        this.create('permission_accesses', (table) => {
            table.increments();
            table.string('repeat_by', 80);
            table.string('day_week', 80);
            table.time('start_hour', 6);
            table.time('end_hour', 6);

            // table
            //     .integer("elem_times_id", 25)
            //     .unsigned()
            //     .references("id")
            //     .inTable("elem_times")
            //     .onDelete("CASCADE");
            table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.integer('group_zone_id', 25).unsigned().references('id').inTable('group_zone_zones').onDelete('CASCADE');
            table.engine('innodb');
            table.timestamps();
        });
    }

    down() {
        this.drop('permission_accesses');
    }
}

module.exports = GroupAccessSchema;
