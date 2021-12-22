"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Level extends Model {
  shelf() {
    return this.belongsTo("App/Models/Shelf", "id", "shelf_id");
  }
}

module.exports = Level;
