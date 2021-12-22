"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class DeliveryPackSchema extends Schema {
  up() {
    this.create("delivery_packs", (table) => {
      table.date("delivery_date").notNullable();
      table.integer("truck_id", 25);
      table.integer("trucker_id", 25);
      table.integer("delivery_agent_id", 25);
      table.integer("product_id", 25);
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("delivery_packs");
  }
}

module.exports = DeliveryPackSchema;
