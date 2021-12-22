"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class LocationSchema extends Schema {
  up() {
    this.create("locations", (table) => {
      table.string("code", 80).notNullable();
      table
        .integer("level_id", 25)
        .unsigned()
        .references("id")
        .inTable("levels")
        .onDelete("CASCADE");
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("locations");
  }
}

module.exports = LocationSchema;
