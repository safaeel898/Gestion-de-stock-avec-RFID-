"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class ShelfSchema extends Schema {
  up() {
    this.create("shelves", (table) => {
      table.string("code", 80).notNullable().unique();
      table
        .integer("area_id", 25)
        .unsigned()
        .references("id")
        .inTable("areas")
        .onDelete("CASCADE");
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("shelves");
  }
}

module.exports = ShelfSchema;
