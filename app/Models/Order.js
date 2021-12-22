"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Order extends Model {
  client() {
    return this.belongsTo("App/Models/Client", "id", "client_id");
  }

  delivery() {
    return this.hasOne("App/Models/Delivery", "id", "delivery_id");
  }

  product_item() {
    return this.hasOne("App/Models/ProductItem", "id", "_id");
  }
}

module.exports = Order;
