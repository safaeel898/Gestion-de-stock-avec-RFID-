"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class UserRoleSchema extends Schema {
  up() {
    this.create("user_roles", (table) => {
      table.increments();
      table
        .integer("user_id", 25)
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .integer("role_id", 25)
        .unsigned()
        .references("id")
        .inTable("roles")
        .onDelete("CASCADE");
      table.timestamps();
    });
  }

  down() {
    this.drop("user_roles");
  }
}

module.exports = UserRoleSchema;
