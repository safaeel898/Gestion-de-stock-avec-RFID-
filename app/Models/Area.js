"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Area extends Model {
  warehouse() {
    return this.belongsTo("App/Models/Warehouse", "id", "warehouse_id");
  }
  shelf() {
    return this.hasOne("App/Models/Shelf", "id", "area_id");
  }
}

module.exports = Area;
