"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class OrderSchema extends Schema {
  up() {
    this.create("orders", (table) => {
      table.increments();

      table.date("order_registration_date").notNullable();

      table
        .integer("client_id", 25)
        .unsigned()
        .references("id")
        .inTable("clients")
        .onDelete("CASCADE");

      table.float("amount_due");
      table.float("amount_paid");

      table.timestamps();
    });
  }

  down() {
    this.drop("orders");
  }
}

module.exports = OrderSchema;
