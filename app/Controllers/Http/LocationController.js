"use strict";
const Database = use("Database");
const Location = use("App/Models/Location");
const ProductItem = use("App/Models/ProductItem");
class LocationController {
  async index({ response, request, view, params }) {
    const page = params.page ? params.page : 1;
    const id_area = params.id_area;
    const id_warehouse = params.id_warehouse;
    const id_shelf = params.id_shelf;
    const id_level = params.id_level;
    const location = await Database.select(
      "locations.*",
      Database.raw("COUNT( DISTINCT product_items.id) as items")
    )
      .from("locations")
      .leftJoin("product_items", "product_items.location_id", "locations.id")
      .where("locations.level_id", id_level)
      .groupBy("locations.id")
      .paginate(page, 10);

    return view.render("dashboard.location.index", {
      locations: location,
      page: page,
      id_area: id_area,
      id_shelf: id_shelf,
      id_level: id_level,
      id_warehouse: id_warehouse,
    });
  }

  async create({ response, request, view, params }) {
    const id_area = params.id_area;
    const id_warehouse = params.id_warehouse;
    const id_shelf = params.id_shelf;
    const id_level = params.id_level;
    return view.render("dashboard.location.create", {
      id_area: id_area,
      id_shelf: id_shelf,
      id_level: id_level,
      id_warehouse: id_warehouse,
    });
  }
  async store({ request, response }) {
    const { code, area, warehouse, shelf, level } = request.all();
    const location = new Location();
    location.code = code;
    location.level_id = level;
    await location.save().then(function () {
      console.log("a location has been add");
    });
    return response.redirect(
      "/warehouse/" +
        warehouse +
        "/area/" +
        area +
        "/shelf/" +
        shelf +
        "/level/" +
        level +
        "/location/list"
    );
  }
  async addItem({ view, params }) {
    const id_area = params.id_area;
    const id_warehouse = params.id_warehouse;
    const id_shelf = params.id_shelf;
    const id_level = params.id_level;
    const id_location = params.id_location;
    const products = await Database.from("products");
    const product_item = await Database.select(
      "product_items.id",
      "product_items.barecode",
      "products.product_name"
    )
      .from("product_items")
      .leftJoin("products", "product_items.product_id", "products.id")
      .where("product_items.location_id", id_location);
    return view.render("dashboard.location.item", {
      id_area: id_area,
      id_shelf: id_shelf,
      id_level: id_level,
      id_location: id_location,
      id_warehouse: id_warehouse,
      products: products,
      items: product_item,
    });
  }
  async Items({ response, params }) {
    const { id } = params;
    const product_item = await Database.select("product_items.*")
      .from("product_items")
      .where({ product_id: id, location_id: null });
    return response.status(200).send({ data: "yes", items: product_item });
  }
  async populate({ response, params }) {
    const { id } = params;
    const products = await Database.select(
      "product_items.id",
      "product_items.barecode",
      "products.product_name"
    )
      .from("product_items")
      .leftJoin("products", "product_items.product_id", "products.id")
      .where("product_items.location_id", id);
    console.log(products);
    return response.status(200).send({ data: "yes", updatedts: products });
  }

  async Items_update({ response, request, view, params }) {
    const item = request.input("item");
    const location = request.input("location");
    for (var i = 0; i < item; i++) {
      const item_id = request.input("item-" + i);
      if (item_id != undefined && location != undefined) {
        const affectedRows = await Database.table("product_items")
          .where("id", item_id)
          .update("location_id", location);
      }
    }
    const products = await Database.select(
      "product_items.id",
      "product_items.barecode",
      "products.product_name"
    )
      .from("product_items")
      .leftJoin("products", "product_items.product_id", "products.id")
      .where("product_items.location_id", location);
    return response.status(200).send({ data: "yes", updatedts: products });
  }
  async delete({ response, request, view, params }) {
    const { id } = params;
    const location = await Location.find(id);
    await location
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
  async delete_item({ response, request, view, params }) {
    const { id } = params;

    const productItem = await ProductItem.find(id);

    productItem.location_id = null;
    await productItem
      .save()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }

  async edit({ view, params }) {
    const { id_warehouse, id_area, id_shelf, id_level, id } = params;
    const location = await Location.find(id);
    return view.render("dashboard.location.update", {
      id_level: id_level,
      location: location,
      id_shelf: id_shelf,
      id_area: id_area,
      id_warehouse: id_warehouse,
      id: id,
    });
  }

  // Store user POST
  async update({ request, response }) {
    const { warehouse, area, shelf, level, id, code } = request.all();
    const location = await Location.find(id);
    if (code != "" && code != undefined) {
      location.code = code;
    }

    await location.save().then(function () {
      console.log("A location has been updated");
    });
    return response.redirect(
      "/warehouse/" +
        warehouse +
        "/area/" +
        area +
        "/shelf/" +
        shelf +
        "/level/" +
        level +
        "/location/list"
    );
  }
}

module.exports = LocationController;
