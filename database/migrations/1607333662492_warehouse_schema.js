"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class WarehouseSchema extends Schema {
  up() {
    this.create("warehouses", (table) => {
      table.string("name", 80).notNullable().unique();
      table.string("address", 120);
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("warehouses");
  }
}

module.exports = WarehouseSchema;
