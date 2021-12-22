'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserSchema extends Schema {
    up() {
        this.create('users', (table) => {
            table.increments();
            table.string('username', 80).notNullable().unique();
            table.string('firstname', 80).notNullable();
            table.string('familyname', 80).notNullable();
            table.string('email', 254).notNullable().unique();
            table.string('password', 60).notNullable();
            table.string('phonenumber', 60);
            table.string('status', 60);
            table
                .integer('sup_identif_id', 25)
                .unsigned()
                .references('id')
                .inTable('support_identifications')
                .onDelete('CASCADE');
            table.timestamps();

            table.engine('innodb');
        });
    }

    down() {
        this.drop('users');
    }
}

module.exports = UserSchema;
