"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class DutySchema extends Schema {
  up() {
    this.create("duties", (table) => {
      table
        .integer("user_id", 25)
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("title", 80);
      table.string("duty_description", 255);
      table.date("due_date");
      table.date("duty_date");
      table.boolean("complete");
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("duties");
  }
}

module.exports = DutySchema;
