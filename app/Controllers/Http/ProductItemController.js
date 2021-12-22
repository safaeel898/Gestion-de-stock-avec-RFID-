"use strict";
const Database = use("Database");
const ProductItem = use("App/Models/ProductItem");
class ProductItemController {
  async index({ response, request, view, params }) {
    const page = params.page ? params.page : 1;
    const id_product = params.id_product;
    const product_item = await Database.select(
      "product_items.*",
      "products.product_name as product"
    )
      .from("product_items")
      .leftJoin("products", "product_items.product_id", "products.id")
      .where("product_items.product_id", id_product)
      .paginate(page, 10);

    return view.render("dashboard.product_item.index", {
      product_items: product_item,
      id_product: id_product,
      page: page,
    });
  }

  async create({ view, params }) {
    const id_bill = params.id_bill;
    const id_provider = params.id_provider;
    const products = await Database.from("products");
    return view.render("dashboard.product_item.create", {
      id_bill: id_bill,
      id_provider: id_provider,
      products: products,
    });
  }
  async store({ request, response }) {
    const { barecode, product, id_bill, id_provider } = request.all();
    console.log(request.all());
    const product_item = new ProductItem();
    product_item.barecode = barecode;
    product_item.product_id = product;
    product_item.bill_id = id_bill;

    await product_item.save().then(function () {
      console.log("a product item has been add");
    });
    return response.redirect(
      "/provider/" + id_provider + "/bill/" + id_bill + "/item/list"
    );
  }

  async edit({ view, params }) {
    const { id } = params;
    const productItem = await ProductItem.find(id);

    return view.render("dashboard.product_item.update", {
      productItem: productItem,
      id: id,
    });
  }

  // Store user POST
  async update({ request, response }) {
    const { id, barecode } = request.all();
    const productItem = await ProductItem.find(id);
    if (barecode != "" && barecode != undefined) {
      productItem.barecode = barecode;
    }

    await productItem.save().then(function () {
      console.log("A product item has been updated");
    });
    return response.redirect("/product/list");
  }

  async delete({ response, params }) {
    const { id } = params;
    const productItem = await ProductItem.find(id);
    await productItem
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
}

module.exports = ProductItemController;
