"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class BillSchema extends Schema {
  up() {
    this.create("bills", (table) => {
      table.date("date_issued");
      table.date("date_of_paiment");
      table.float("amount_due");
      table.float("amount_paid");
      table
        .integer("provider_id", 25)
        .unsigned()
        .references("id")
        .inTable("providers")
        .onDelete("CASCADE");
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("bills");
  }
}

module.exports = BillSchema;
