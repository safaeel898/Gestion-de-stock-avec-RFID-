'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class TypeSubscriptionSchema extends Schema {
    up() {
        this.create('type_subscriptions', (table) => {
            table.increments();
            table.string('type', 80);
            table.engine('innodb');
            table.timestamps();
        });
    }

    down() {
        this.drop('type_subscriptions');
    }
}

module.exports = TypeSubscriptionSchema;
