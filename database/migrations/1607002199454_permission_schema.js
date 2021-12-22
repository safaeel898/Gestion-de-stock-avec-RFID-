"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class PermissionSchema extends Schema {
  up() {
    this.create("permissions", (table) => {
      table.string("name", 80).notNullable().unique();
      table.increments();
      table.timestamps();
    });
  }

  down() {
    this.drop("permissions");
  }
}

module.exports = PermissionSchema;
