"use strict";
const Database = use("Database");
const Bill = use("App/Models/Bill");
const ProductItem = use("App/Models/ProductItem");
const moment = require("moment");

class BillController {
  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const id_provider = params.id_provider;
    const bills = await Database.from("bills")
      .where("provider_id", id_provider)
      .paginate(page, 10);

    for (var i = 0; i < bills.data.length; i++) {
      bills.data[i].date_issued = dateMaker(bills.data[i].date_issued);
      bills.data[i].date_of_paiment = dateMaker(bills.data[i].date_of_paiment);
    }
    return view.render("dashboard.bill.index", {
      bills: bills,
      id_provider: id_provider,
    });
  }
  async create({ view, params }) {
    const id_provider = params.id_provider;
    const products = await Database.from("products");
    return view.render("dashboard.bill.create", {
      id_provider: id_provider,
      products: products,
    });
  }
  async store({ request, response }) {
    const {
      provider,
      item,
      amount_due,
      amount_paid,
      date_issued,
      date_of_paiment,
    } = request.all();
    const bill = new Bill();
    bill.amount_due = amount_due;
    bill.amount_paid = amount_paid;
    bill.date_issued = moment(date_issued, "MM/DD/YYYY").format(
      "YYYY-MM-DD hh:mm:ss"
    );
    bill.date_of_paiment = moment(date_of_paiment, "MM/DD/YYYY").format(
      "YYYY-MM-DD hh:mm:ss"
    );
    bill.provider_id = provider;
    await bill.save().then(function () {
      console.log("a bill has been add");
    });
    for (var i = 0; i < item; i++) {
      const item = request.input("item-" + i);
      const product = request.input("product-" + i);
      const product_item = new ProductItem();
      product_item.barecode = item;
      product_item.product_id = product;
      product_item.bill_id = bill.id;
      await product_item.save().then(function () {
        console.log("a product item has been add");
      });
    }

    return response.redirect("/provider/" + provider + "/bill/list");
  }

  async item_index({ view, params }) {
    const page = params.page ? params.page : 1;
    const id_provider = params.id_provider;
    const id_bill = params.id_bill;
    const product_item = await Database.select(
      "product_items.*",
      "products.product_name as product"
    )
      .from("product_items")
      .leftJoin("products", "product_items.product_id", "products.id")
      .where("bill_id", id_bill)
      .paginate(page, 10);
    console.log(id_provider + "    " + id_bill + "     ");
    return view.render("dashboard.product_item.index", {
      product_items: product_item,
      id_provider: id_provider,
      id_bill: id_bill,
      page: page,
    });
  }

  async edit({ view, params }) {
    const { id, id_provider } = params;
    const bill = await Bill.find(id);
    bill.date_issued = dateInputMaker(bill.date_issued);
    bill.date_of_paiment = dateInputMaker(bill.date_of_paiment);
    return view.render("dashboard.bill.update", {
      bill: bill,
      id: id,
      id_provider: id_provider,
    });
  }

  async update({ request, response }) {
    const {
      id,
      provider,
      amount_due,
      amount_paid,
      date_issued,
      date_of_paiment,
    } = request.all();
    const bill = await Bill.find(id);
    if (amount_due != "" && amount_due != undefined) {
      bill.amount_due = amount_due;
    }
    if (amount_paid != "" && amount_paid != undefined) {
      bill.amount_paid = amount_paid;
    }
    if (date_issued != "" && date_issued != undefined) {
      bill.date_issued = moment(date_issued, "MM/DD/YYYY").format(
        "YYYY-MM-DD hh:mm:ss"
      );
    }
    if (date_of_paiment != "" && date_of_paiment != undefined) {
      bill.date_of_paiment = moment(date_of_paiment, "MM/DD/YYYY").format(
        "YYYY-MM-DD hh:mm:ss"
      );
    }
    await bill.save().then(function () {
      console.log("a bill has been updated");
    });
    return response.redirect("/provider/" + provider + "/bill/list");
  }
  async delete({ response, request, view, params }) {
    const { id } = params;
    const bill = await Bill.find(id);
    await bill
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
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
  var day = date.getDate();
  var month = date.getMonth() + 1 + "";
  if (month.length == 1) {
    month = "0" + month;
  }
  var year = date.getFullYear();
  return month + "/" + day + "/" + year;
}
module.exports = BillController;
