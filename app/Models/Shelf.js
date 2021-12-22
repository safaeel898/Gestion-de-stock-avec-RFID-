"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Shelf extends Model {
  area() {
    return this.belongsTo("App/Models/Area", "id", "area_id");
  }
  level() {
    return this.hasOne("App/Models/Level", "id", "shelf_id");
  }
}

module.exports = Shelf;
