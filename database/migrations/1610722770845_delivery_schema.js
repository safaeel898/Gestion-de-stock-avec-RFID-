"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class DeliverySchema extends Schema {
  up() {
    this.create("deliveries", (table) => {
      table.increments();
      table
        .integer("order_id", 25)
        .unsigned()
        .references("id")
        .inTable("orders")
        .onDelete("CASCADE");
      table
        .integer("delivery_pack_id", 25)
        .unsigned()
        .references("id")
        .inTable("delivery_packs")
        .onDelete("SET NULL");
      table.date("delivery_expected_date").notNullable();
      table.date("delivery_effective_date");

      table.timestamps();
    });
  }

  down() {
    this.drop("deliveries");
  }
}

module.exports = DeliverySchema;
