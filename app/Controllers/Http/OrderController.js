"use strict";

const Database = use("Database");
const Order = use("App/Models/Order");
const ProductItem = use("App/Models/ProductItem");
class OrderController {
  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const id_client = params.id_client;
    const orders = await Database.select(
      "orders.*",
      Database.raw("COUNT(deliveries.id) as deliveries")
    )
      .from("orders")
      .leftJoin("deliveries", "deliveries.order_id", "orders.id")
      .where("orders.client_id", id_client)
      .groupBy("orders.id")
      .paginate(page, 10);
    for (var i = 0; i < orders.data.length; i++) {
      orders.data[i].order_registration_date = dateMaker(
        orders.data[i].order_registration_date
      );
    }

    return view.render("dashboard.order.index", {
      orders: orders,
      page: page,
      id_client: id_client,
    });
  }

  async create({ view, params }) {
    const id_client = params.id_client;
    const products = await Database.from("products");
    return view.render("dashboard.order.create", {
      id_client: id_client,
      products: products,
    });
  }

  async store({ request, response }) {
    const {
      client,
      order_registration_date,
      amount_paid,
      amount_due,
      item,
    } = request.all();

    const order = new Order();
    order.client_id = client;
    order.order_registration_date = order_registration_date;
    order.amount_due = amount_due;
    order.amount_paid = amount_paid;

    await order.save().then(function () {
      console.log("An order has been added");
    });
    for (var i = 0; i < item; i++) {
      const item_id = request.input("item-" + i);
      if (item_id != undefined) {
        const affectedRows = await Database.table("product_items")
          .where("id", item_id)
          .update("order_id", order.id);
      }
    }
    return response.redirect("/client/" + client + "/order/list");
  }
  async Items({ response, request, view, params }) {
    const { id } = params;
    const product_item = await Database.select("product_items.*")
      .from("product_items")
      .where({ product_id: id, order_id: null });
    return response.status(200).send({ data: "yes", items: product_item });
  }
  async delete({ response, request, view, params }) {
    const { id } = params;
    const order = await Order.find(id);
    await order
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
  async edit({ response, request, view, params }) {
    const { id, id_client } = params;
    const order = await Order.find(id);
    const products = await Database.from("products");
    order.order_registration_date = dateInputMaker(
      order.order_registration_date
    );

    const product_item = await Database.select(
      "product_items.*",
      "products.product_name"
    )
      .from("product_items")
      .leftJoin("products", "product_items.product_id", "products.id")
      .where("order_id", id);

    return view.render("dashboard.order.update", {
      items: product_item,
      order: order,
      id: id,
      products: products,
      id_client: id_client,
    });
  }
  async delete_item({ response, request, view, params }) {
    const { id } = params;

    const productItem = await ProductItem.find(id);

    productItem.order_id = null;
    await productItem
      .save()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
  async update({ request, response }) {
    const {
      id,
      client,
      item,
      order_registration_date,
      amount_due,
      amount_paid,
    } = request.all();
    const order = await Order.find(id);

    if (order_registration_date != "" && order_registration_date != undefined) {
      order.order_registration_date = order_registration_date;
    }
    if (amount_due != "" && amount_due != undefined) {
      order.amount_due = amount_due;
    }
    if (amount_paid != "" && amount_paid != undefined) {
      order.amount_paid = amount_paid;
    }
    for (var i = 0; i < item; i++) {
      const item_id = request.input("item-" + i);
      if (item_id != undefined) {
        const affectedRows = await Database.table("product_items")
          .where("id", item_id)
          .update("order_id", id);
      }
    }
    await order.save().then(function () {
      console.log("A product item has been updated");
    });
    return response.redirect("/client/" + client + "/order/list");
  }
}
function dateMaker(d) {
  var date = new Date(d);
  var day = date.getDate();
  var month = date.getMonth() + 1 + "";
  if (month.length == 1) {
    month = "0" + month;
  }
  var year = date.getFullYear();
  return day + "-" + month + "-" + year;
}
function dateInputMaker(d) {
  var date = new Date(d);
  var day = date.getDate() + "";
  var month = date.getMonth() + 1 + "";
  if (month.length == 1) {
    month = "0" + month;
  }
  if (day.length == 1) {
    day = "0" + day;
  }
  var year = date.getFullYear();
  return year + "-" + month + "-" + day;
}
module.exports = OrderController;
