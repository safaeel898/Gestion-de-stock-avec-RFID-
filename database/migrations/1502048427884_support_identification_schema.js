'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class SupportIdentificationSchema extends Schema {
    up() {
        this.create('support_identifications', (table) => {
            table.increments();
            table.string('name', 80);
            table.timestamps();
            table.engine('innodb');
        });
    }

    down() {
        this.drop('support_identifications');
    }
}

module.exports = SupportIdentificationSchema;
