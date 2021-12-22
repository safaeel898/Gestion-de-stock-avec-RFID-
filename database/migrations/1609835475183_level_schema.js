"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class LevelSchema extends Schema {
  up() {
    this.create("levels", (table) => {
      table.string("code", 80).notNullable().unique();
      table.integer("max_storage", 25).notNullable();
      table.integer("weight_capacity", 25).notNullable();
      table
        .integer("shelf_id", 25)
        .unsigned()
        .references("id")
        .inTable("shelves")
        .onDelete("CASCADE");
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("levels");
  }
}

module.exports = LevelSchema;
