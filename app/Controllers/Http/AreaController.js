"use strict";
const Database = use("Database");
const Area = use("App/Models/Area");

class AreaController {
  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const id_warehouse = params.id_warehouse;
    const areas = await Database.select(
      "areas.*",
      Database.raw("COUNT(DISTINCT shelves.id) as shelves"),
      Database.raw("COUNT(DISTINCT levels.id) as levels"),
      Database.raw("COUNT( DISTINCT locations.id) as locations"),
      Database.raw("COUNT( DISTINCT product_items.id) as items")
    )
      .from("areas")
      .leftJoin("shelves", "shelves.area_id", "areas.id")
      .leftJoin("levels", "levels.shelf_id", "shelves.id")
      .leftJoin("locations", "locations.level_id", "levels.id")
      .leftJoin("product_items", "product_items.location_id", "locations.id")
      .where("areas.warehouse_id", id_warehouse)
      .groupBy("areas.id")
      .paginate(page, 10);

    return view.render("dashboard.area.index", {
      areas: areas,
      page: page,
      id_warehouse: id_warehouse,
    });
  }

  async create({ view, params }) {
    const id_warehouse = params.id_warehouse;
    return view.render("dashboard.area.create", { id_warehouse: id_warehouse });
  }
  async store({ request, response }) {
    const { code, warehouse } = request.all();
    const area = new Area();
    area.code = code;
    area.warehouse_id = warehouse;
    await area.save().then(function () {
      console.log("an area has been add");
    });
    return response.redirect("/warehouse/" + warehouse + "/area/list");
  }

  async edit({ view, params }) {
    const { id_warehouse, id } = params;
    const area = await Area.find(id);

    return view.render("dashboard.area.update", {
      area: area,
      id_warehouse: id_warehouse,
      id: id,
    });
  }

  // Store user POST
  async update({ request, response }) {
    const { id_warehouse, id, code } = request.all();
    const area = await Area.find(id);
    if (code != "" && code != undefined) {
      area.code = code;
    }

    await area.save().then(function () {
      console.log("An area has been updated");
    });
    return response.redirect("/warehouse/" + id_warehouse + "/area/list");
  }
  async delete({ response, params }) {
    const { id } = params;
    const area = await Area.find(id);
    await area
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
}

module.exports = AreaController;
