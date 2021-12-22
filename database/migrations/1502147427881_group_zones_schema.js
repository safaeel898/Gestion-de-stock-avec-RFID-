'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class GroupZonesSchema extends Schema {
    up() {
        this.create('group_zones', (table) => {
            table.increments();
            table.string('name', 80);
            table.timestamps();
            table.engine('innodb');
        });
    }

    down() {
        this.drop('group_zones');
    }
}

module.exports = GroupZonesSchema;
