"use strict";

const Database = use("Database");
const DeliveryPack = use("App/Models/DeliveryPack");
class DeliveryPackController {
  async index({ response, request, view, params }) {
    const page = params.page ? params.page : 1;

    //const delivery_pack = await Database.from("delivery_packs").paginate(page, 10)
    const delivery_packs = await Database.select(
      "delivery_packs.*",
      Database.raw("COUNT( DISTINCT deliveries.id) as deliveries")
    )
      .leftJoin(
        "deliveries",
        "deliveries.delivery_pack_id",
        "delivery_packs.id"
      )
      .from("delivery_packs")
      .groupBy("delivery_packs.id")
      .paginate(page, 10);
    for (var i = 0; i < delivery_packs.data.length; i++) {
      delivery_packs.data[i].delivery_date = dateMaker(
        delivery_packs.data[i].delivery_date
      );
    }
    return view.render("dashboard.delivery_pack.index", {
      delivery_packs: delivery_packs,
    });
  }
  async create({ view, params }) {
    const deliveries = await Database.from("deliveries").where(
      "delivery_pack_id",
      null
    );
    return view.render("dashboard.delivery_pack.create", {
      deliveries: deliveries,
    });
  }
  async store({ request, response }) {
    const { delivery_date, del } = request.all();

    const pack = new DeliveryPack();
    pack.delivery_date = delivery_date;
    await pack.save().then(function () {
      console.log("a pack has been add");
    });
    for (var i = 0; i < del.length; i++) {
      const affectedRows = await Database.table("deliveries")
        .where("id", del[i])
        .update("delivery_pack_id", pack.id);
    }

    return response.redirect("/delivery/list");
  }

  async deliveries({ params, view }) {
    const page = params.page ? params.page : 1;
    const id_pack = params.id_pack;

    const deliveries = await Database.from("deliveries")
      .where("deliveries.delivery_pack_id", id_pack)
      .paginate(page, 10);
    for (var i = 0; i < deliveries.data.length; i++) {
      deliveries.data[i].delivery_expected_date = dateMaker(
        deliveries.data[i].delivery_expected_date
      );

      if (deliveries.data[i].delivery_effective_date == null) {
        deliveries.data[i].delivery_effective_date = "-";
        deliveries.data[i].delivery_situation = "not delivered yet";
      } else {
        deliveries.data[i].delivery_effective_date = dateMaker(
          deliveries.data[i].delivery_effective_date
        );
        deliveries.data[i].delivery_situation = "delivered";
      }
    }

    return view.render("dashboard.delivery.index", {
      deliveries: deliveries,
      page: page,
      id_pack: id_pack,
    });
  }

  async delete({ response, request, view, params }) {
    const { id } = params;
    const deliveryPack = await DeliveryPack.find(id);
    await deliveryPack
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }

  async edit({ view, params }) {
    const { id } = params;
    const delivery_pack = await DeliveryPack.find(id);

    delivery_pack.delivery_date = dateInputMaker(delivery_pack.delivery_date);

    return view.render("dashboard.delivery_pack.update", {
      delivery_pack: delivery_pack,
      id: id,
    });
  }

  async update({ request, response }) {
    const { delivery_date, id } = request.all();

    const delivery_pack = await DeliveryPack.find(id);

    if (delivery_date != "" && delivery_date != undefined) {
      delivery_pack.delivery_date = delivery_date;
    }

    await delivery_pack.save().then(function () {
      console.log("A delivery pack has been updated");
    });
    return response.redirect("/delivery/list");
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

module.exports = DeliveryPackController;
