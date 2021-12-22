"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class ProviderSchema extends Schema {
  up() {
    this.create("providers", (table) => {
      table.string("companyName", 80).notNullable();
      table.string("contactName", 80);
      table.string("address", 80);
      table.string("City", 80);
      table.string("Country", 80);
      table.string("Phone", 80);
      table.string("Fax", 80);
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("providers");
  }
}

module.exports = ProviderSchema;
