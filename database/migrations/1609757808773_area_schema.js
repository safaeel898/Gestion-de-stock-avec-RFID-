"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AreaSchema extends Schema {
  up() {
    this.create("areas", (table) => {
      table.string("code", 80).notNullable().unique();
      table
        .integer("warehouse_id", 25)
        .unsigned()
        .references("id")
        .inTable("warehouses")
        .onDelete("CASCADE");
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("areas");
  }
}

module.exports = AreaSchema;
