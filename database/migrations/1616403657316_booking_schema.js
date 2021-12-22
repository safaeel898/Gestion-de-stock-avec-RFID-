'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class BookingSchema extends Schema {
    up() {
        this.create('bookings', (table) => {
            table.increments();
            table.date('start_date', 80);
            table.date('end_date', 80);
            table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.integer('group_zone_id', 25).unsigned().references('id').inTable('group_zone_zones').onDelete('CASCADE');
            table.engine('innodb');
            table.timestamps();
        });
    }

    down() {
        this.drop('bookings');
    }
}

module.exports = BookingSchema;
