"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class ProductSchema extends Schema {
  up() {
    this.create("products", (table) => {
      table.string("product_name", 80);
      table.string("description", 255);
      table.float("price");
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("products");
  }
}

module.exports = ProductSchema;
