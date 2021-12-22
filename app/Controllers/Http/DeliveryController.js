"use strict";

const Database = use("Database");
const Delivery = use("App/Models/Delivery");
const Order = use("App/Models/Order");

class DeliveryController {
  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const id_client = params.id_client;
    const id_order = params.id_order;

    const deliveries = await Database.from("deliveries")
      .where("deliveries.order_id", id_order)
      .paginate(page, 10);
    for (var i = 0; i < deliveries.data.length; i++) {
      deliveries.data[i].delivery_expected_date = dateMaker(
        deliveries.data[i].delivery_expected_date
      );

      if (deliveries.data[i].delivery_effective_date == null) {
        deliveries.data[i].delivery_effective_date = "-";
        deliveries.data[i].delivery_situation = "not delivered yet";
        deliveries.data[i].status = 0;
      } else {
        deliveries.data[i].delivery_effective_date = dateMaker(
          deliveries.data[i].delivery_effective_date
        );
        deliveries.data[i].delivery_situation = "delivered";
        deliveries.data[i].status = 1;
      }
    }

    return view.render("dashboard.delivery.index", {
      deliveries: deliveries,
      page: page,
      id_order: id_order,
      id_client: id_client,
    });
  }

  async create({ view, params }) {
    const id_order = params.id_order;
    const id_client = params.id_client;

    return view.render("dashboard.delivery.create", {
      id_order: id_order,
      id_client: id_client,
    });
  }

  async store({ request, response }) {
    const { client, order, delivery_expected_date } = request.all();

    const delivery = new Delivery();
    delivery.order_id = order;
    delivery.delivery_expected_date = delivery_expected_date;

    await delivery.save().then(function () {
      console.log("A delivery has been added");
    });

    return response.redirect(
      "/client/" + client + "/order/" + order + "/delivery/list"
    );
  }

  async edit({ response, request, view, params }) {
    const { id } = params;
    const delivery = await Delivery.find(id);

    delivery.delivery_expected_date = dateInputMaker(
      delivery.delivery_expected_date
    );

    return view.render("dashboard.delivery.update", {
      delivery: delivery,
      id: id,
    });
  }

  async update({ request, response }) {
    //console.log("I am here !")

    const { id, delivery_expected_date } = request.all();

    const delivery = await Delivery.find(id);

    if (delivery_expected_date != "" && delivery_expected_date != undefined) {
      delivery.delivery_expected_date = delivery_expected_date;
    }

    await delivery.save().then(function () {
      console.log("A delivery has been updated");
    });

    return response.redirect("/client/list");
  }

  async delete({ response, request, view, params }) {
    const { id } = params;
    const delivery = await Delivery.find(id);
    await delivery
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
  async free({ response, request, view, params }) {
    const { id } = params;
    const delivery = await Delivery.find(id);
    delivery.delivery_pack_id = null;
    await delivery
      .save()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }

  async delivered({ response, request, view, params }) {
    const { id } = params;
    return view.render("dashboard.delivery.delivered", { id: id });
  }
  async confirme({ response, request, view, params }) {
    const { id, delivery_effective_date } = request.all();
    const delivery = await Delivery.find(id);

    if (delivery_effective_date != "" && delivery_effective_date != undefined) {
      delivery.delivery_effective_date = delivery_effective_date;
    }

    await delivery.save().then(function () {
      console.log("A delivery has been updated");
    });
    const order = await Order.find(delivery.order_id);
    return response.redirect(
      "/client/" + order.client_id + "/order/" + order.id + "/delivery/list"
    );
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
module.exports = DeliveryController;
