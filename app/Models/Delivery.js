"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Delivery extends Model {
  delivery() {
    return this.belongsTo("App/Models/Order", "id", "order_id");
  }
}

module.exports = Delivery;
