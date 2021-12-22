"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class ClientSchema extends Schema {
  up() {
    this.create("clients", (table) => {
      table.increments();
      table.string("firstname", 80).notNullable();
      table.string("familyname", 80).notNullable();
      table.string("email", 254).notNullable().unique();
      //table.string('password', 60).notNullable()
      table.string("phonenumber", 60);
      table.string("address", 500);

      //table.string('status', 60)
      table.timestamps();
    });
  }

  down() {
    this.drop("clients");
  }
}

module.exports = ClientSchema;
