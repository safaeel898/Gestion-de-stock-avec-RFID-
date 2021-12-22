"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class RolePermissionSchema extends Schema {
  up() {
    this.create("role_permissions", (table) => {
      table.increments();
      table
        .integer("role_id", 25)
        .unsigned()
        .references("id")
        .inTable("roles")
        .onDelete("CASCADE");
      table
        .integer("permission_id", 25)
        .unsigned()
        .references("id")
        .inTable("permissions")
        .onDelete("CASCADE");
      table.timestamps();
    });
  }

  down() {
    this.drop("role_permissions");
  }
}

module.exports = RolePermissionSchema;
