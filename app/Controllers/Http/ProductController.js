"use strict";
const Database = use("Database");
const Product = use("App/Models/Product");
const ProductItem = use("App/Models/ProductItem");
class ProductController {
  async index({ response, request, view, params }) {
    const page = params.page ? params.page : 1;
    const product = await Database.select(
      "products.*",
      Database.raw("COUNT( DISTINCT product_items.id) as items")
    )
      .from("products")
      .leftJoin("product_items", "product_items.product_id", "products.id")
      .groupBy("products.id")
      .paginate(page, 10);

    return view.render("dashboard.product.index", {
      products: product,
      page: page,
    });
  }

  async create({ response, request, view, params }) {
    return view.render("dashboard.product.create");
  }

  async store({ request, response }) {
    const { product_name, description, price } = request.all();
    const product = new Product();
    product.product_name = product_name;
    product.description = description;
    product.price = price;
    await product.save().then(function () {
      console.log("a product has been add");
    });
    return response.redirect("/product/list");
  }

  async edit({ response, request, view, params }) {
    const { id } = params;
    const product = await Product.find(id);
    console.log(product);
    return view.render("dashboard.product.update", {
      product: product,
      id: id,
    });
  }

  async update({ request, response }) {
    const { id, name, description, price } = request.all();
    const product = await Product.find(id);
    if (name != "" && name != undefined) {
      product.product_name = name;
    }
    if (description != "" && description != undefined) {
      product.description = description;
    }
    if (price != "" && price != undefined) {
      product.price = price;
    }

    await product.save().then(function () {
      console.log("A product has been updated");
    });
    return response.redirect("/product/list");
  }
  async delete({ response, request, view, params }) {
    const { id } = params;
    const product = await Product.find(id);
    await product
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
}

module.exports = ProductController;
