"use strict";
const Database = use("Database");
const Level = use("App/Models/Level");
class LevelController {
  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const id_area = params.id_area;
    const id_warehouse = params.id_warehouse;
    const id_shelf = params.id_shelf;
    const level = await Database.select(
      "levels.*",
      Database.raw("COUNT( DISTINCT locations.id) as locations"),
      Database.raw("COUNT( DISTINCT product_items.id) as items")
    )
      .from("levels")
      .leftJoin("locations", "locations.level_id", "levels.id")
      .leftJoin("product_items", "product_items.location_id", "locations.id")
      .where("levels.shelf_id", id_shelf)
      .groupBy("levels.id")
      .paginate(page, 10);

    return view.render("dashboard.level.index", {
      levels: level,
      page: page,
      id_area: id_area,
      id_shelf: id_shelf,
      id_warehouse: id_warehouse,
    });
  }
  async create({ view, params }) {
    const id_area = params.id_area;
    const id_warehouse = params.id_warehouse;
    const id_shelf = params.id_shelf;
    return view.render("dashboard.level.create", {
      id_area: id_area,
      id_warehouse: id_warehouse,
      id_shelf: id_shelf,
    });
  }
  async store({ request, response }) {
    const {
      code,
      warehouse,
      max_storage,
      weight_capacity,
      shelf,
      area,
    } = request.all();
    const level = new Level();
    level.code = code;
    level.max_storage = max_storage;
    level.weight_capacity = weight_capacity;
    level.shelf_id = shelf;
    await level.save().then(function () {
      console.log("a level has been add");
    });
    return response.redirect(
      "/warehouse/" +
        warehouse +
        "/area/" +
        area +
        "/shelf/" +
        shelf +
        "/level/list"
    );
  }

  async edit({ view, params }) {
    const { id_warehouse, id_area, id_shelf, id } = params;
    const level = await Level.find(id);
    return view.render("dashboard.level.update", {
      level: level,
      id_shelf: id_shelf,
      id_area: id_area,
      id_warehouse: id_warehouse,
      id: id,
    });
  }

  // Store user POST
  async update({ request, response }) {
    const {
      id_warehouse,
      id_area,
      id_shelf,
      id,
      code,
      max_storage,
      weight_capacity,
    } = request.all();
    const level = await Level.find(id);
    if (code != "" && code != undefined) {
      level.code = code;
    }
    if (max_storage != "" && max_storage != undefined) {
      level.max_storage = max_storage;
    }
    if (weight_capacity != "" && weight_capacity != undefined) {
      level.weight_capacity = weight_capacity;
    }

    await level.save().then(function () {
      console.log("A level has been updated");
    });
    return response.redirect(
      "/warehouse/" +
        id_warehouse +
        "/area/" +
        id_area +
        "/shelf/" +
        id_shelf +
        "/level/list"
    );
  }
  async delete({ response, request, view, params }) {
    const { id } = params;
    const level = await Level.find(id);
    await level
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
}

module.exports = LevelController;
