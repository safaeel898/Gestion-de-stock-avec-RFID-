'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class SubscriptionSchema extends Schema {
    up() {
        this.create('subscriptions', (table) => {
            table.increments();
            table.date('start_date', 80);
            table.date('end_date', 80);
            table
                .integer('type_subscription_id', 25)
                .unsigned()
                .references('id')
                .inTable('type_subscriptions')
                .onDelete('CASCADE');
            table.integer('user_id', 25).unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.integer('group_zone_id', 25).unsigned().references('id').inTable('group_zone_zones').onDelete('CASCADE');

            table.timestamps();

            table.engine('innodb');
        });
    }

    down() {
        this.drop('subscriptions');
    }
}

module.exports = SubscriptionSchema;
