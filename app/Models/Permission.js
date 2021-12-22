"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Permission extends Model {
  roles() {
    return this.belongsToMany("App/Model/Role").pivotTable("role_permission");
  }
}

module.exports = Permission;
