"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class ProductItemSchema extends Schema {
  up() {
    this.create("product_items", (table) => {
      table.string("barecode", 80).notNullable().unique();
      table
        .integer("product_id", 25)
        .unsigned()
        .references("id")
        .inTable("products")
        .onDelete("CASCADE");
      table
        .integer("bill_id", 25)
        .unsigned()
        .references("id")
        .inTable("bills")
        .onDelete("CASCADE");
      table
        .integer("location_id", 25)
        .unsigned()
        .references("id")
        .inTable("locations")
        .onDelete("SET NULL");
      table
        .integer("order_id", 25)
        .unsigned()
        .references("id")
        .inTable("orders")
        .onDelete("SET NULL");
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("product_items");
  }
}

module.exports = ProductItemSchema;
