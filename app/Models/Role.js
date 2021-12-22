"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Role extends Model {
  permissions() {
    return this.belongsToMany("App/Model/Permission").pivotTable(
      "role_permission"
    );
  }
  users() {
    return this.belongsToMany("App/Model/User").pivotTable("user_permission");
  }
}

module.exports = Role;
