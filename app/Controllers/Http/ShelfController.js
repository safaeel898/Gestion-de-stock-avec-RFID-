"use strict";
const Database = use("Database");
const Shelf = use("App/Models/Shelf");
class ShelfController {
  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const id_area = params.id_area;
    const id_warehouse = params.id_warehouse;
    const shelf = await Database.select(
      "shelves.*",
      Database.raw("COUNT( DISTINCT levels.id) as levels"),
      Database.raw("COUNT( DISTINCT locations.id) as locations"),
      Database.raw("COUNT( DISTINCT product_items.id) as items")
    )
      .from("shelves")
      .leftJoin("levels", "levels.shelf_id", "shelves.id")
      .leftJoin("locations", "locations.level_id", "levels.id")
      .leftJoin("product_items", "product_items.location_id", "locations.id")
      .where("shelves.area_id", id_area)
      .groupBy("shelves.id")
      .paginate(page, 10);
    console.log(shelf);
    return view.render("dashboard.shelf.index", {
      shelves: shelf,
      page: page,
      id_area: id_area,
      id_warehouse: id_warehouse,
    });
  }
  async create({ view, params }) {
    const id_area = params.id_area;
    const id_warehouse = params.id_warehouse;
    return view.render("dashboard.shelf.create", {
      id_area: id_area,
      id_warehouse: id_warehouse,
    });
  }
  async store({ request, response }) {
    const { code, warehouse, area } = request.all();
    const shelf = new Shelf();
    shelf.code = code;
    shelf.area_id = area;
    await shelf.save().then(function () {
      console.log("a shelf has been add");
    });
    return response.redirect(
      "/warehouse/" + warehouse + "/area/" + area + "/shelf/list"
    );
  }

  async edit({ view, params }) {
    const { id_warehouse, id_area, id } = params;
    const shelf = await Shelf.find(id);
    return view.render("dashboard.shelf.update", {
      shelf: shelf,
      id_area: id_area,
      id_warehouse: id_warehouse,
      id: id,
    });
  }

  // Store user POST
  async update({ request, response }) {
    const { id_warehouse, id_area, id, code } = request.all();
    const shelf = await Shelf.find(id);
    if (code != "" && code != undefined) {
      shelf.code = code;
    }

    await shelf.save().then(function () {
      console.log("A shelf has been updated");
    });
    return response.redirect(
      "/warehouse/" + id_warehouse + "/area/" + id_area + "/shelf/list"
    );
  }

  async delete({ response, request, view, params }) {
    const { id } = params;
    const shelf = await Shelf.find(id);
    await shelf
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
}

module.exports = ShelfController;
