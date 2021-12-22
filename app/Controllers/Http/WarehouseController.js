"use strict";

const Database = use("Database");
const Warehouse = use("App/Models/Warehouse");
class WarehouseController {
  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const warehouses = await Database.select(
      "warehouses.*",
      Database.raw("COUNT(DISTINCT areas.id) as areas"),
      Database.raw("COUNT( DISTINCT shelves.id) as shelves"),
      Database.raw("COUNT( DISTINCT locations.id) as locations"),
      Database.raw("COUNT( DISTINCT product_items.id) as items"),
      Database.raw("COUNT( DISTINCT levels.id) as levels")
    )
      .from("warehouses")
      .leftJoin("areas", "areas.warehouse_id", "warehouses.id")
      .leftJoin("shelves", "shelves.area_id", "areas.id")
      .leftJoin("levels", "levels.shelf_id", "shelves.id")
      .leftJoin("locations", "locations.level_id", "levels.id")
      .leftJoin("product_items", "product_items.location_id", "locations.id")
      .groupBy("warehouses.id")
      .paginate(page, 10);
    return view.render("dashboard.warehouse.index", {
      warehouses: warehouses,
      page: page,
    });
  }

  async create({ view }) {
    return view.render("dashboard.warehouse.create");
  }

  async delete({ response, request, view, params }) {
    const { id } = params;

    const warehouse = await Warehouse.find(id);
    await warehouse
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }

  // Store user POST
  async store({ request, response }) {
    const { name, address } = request.all();
    const warehouse = new Warehouse();
    warehouse.name = name;
    warehouse.address = address;
    await warehouse.save().then(function () {
      console.log("a warehouse has been add");
    });
    return response.redirect("/warehouse/list");
  }

  async edit({ view, params }) {
    const { id } = params;
    const warehouse = await Warehouse.find(id);
    return view.render("dashboard.warehouse.update", {
      warehouse: warehouse,
      id: id,
    });
  }
  // Store user POST
  async update({ request, response }) {
    const { id, name, address } = request.all();
    const warehouse = await Warehouse.find(id);
    if (name != "" && name != undefined) {
      warehouse.name = name;
    }
    if (address != "" && address != undefined) {
      warehouse.address = address;
    }

    await warehouse.save().then(function () {
      console.log("a warehouse has been updated");
    });
    return response.redirect("/warehouse/list");
  }
}

module.exports = WarehouseController;
