'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class GroupZoneZonesSchema extends Schema {
    up() {
        this.create('group_zone_zones', (table) => {
            table.increments();
            table.integer('zone_id', 25).unsigned().references('id').inTable('zones').onDelete('CASCADE');
            table.integer('group_zone_id', 25).unsigned().references('id').inTable('group_zones').onDelete('CASCADE');
            table.timestamps();

            table.engine('innodb');
        });
    }

    down() {
        this.drop('group_zone_zones');
    }
}

module.exports = GroupZoneZonesSchema;
