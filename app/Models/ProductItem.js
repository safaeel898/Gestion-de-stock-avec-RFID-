"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class ProductItem extends Model {
  command() {
    return this.belongsTo("App/Models/Command", "id", "command_id");
  }
}

module.exports = ProductItem;
