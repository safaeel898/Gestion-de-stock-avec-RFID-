"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Warehouse extends Model {
  area() {
    return this.hasOne("App/Models/Area", "id", "warehouse_id");
  }
}

module.exports = Warehouse;
