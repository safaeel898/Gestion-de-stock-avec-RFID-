"use strict";
const Database = use("Database");
const Provider = use("App/Models/Provider");
const Bill = use("App/Models/Bill");

class ProviderController {
  async index({ response, request, view, params }) {
    const page = params.page ? params.page : 1;
    const provider = await Database.from("providers").paginate(page, 10);

    return view.render("dashboard.provider.index", {
      providers: provider,
      page: page,
    });
  }

  async create({ response, request, view, params }) {
    return view.render("dashboard.provider.create");
  }

  async store({ request, response }) {
    const {
      companyName,
      contactName,
      address,
      city,
      country,
      phone,
      fax,
    } = request.all();
    const provider = new Provider();
    provider.companyName = companyName;
    provider.contactName = contactName;
    provider.address = address;
    provider.city = city;
    provider.country = country;
    provider.phone = phone;
    provider.fax = fax;
    await provider.save().then(function () {
      console.log("a provider has been add");
    });
    return response.redirect("/provider/list");
  }

  async edit({ response, request, view, params }) {
    const { id } = params;
    const provider = await Provider.find(id);
    console.log(provider);
    return view.render("dashboard.provider.update", {
      provider: provider,
      id: id,
    });
  }

  async update({ request, response }) {
    const {
      id,
      companyName,
      contactName,
      address,
      city,
      country,
      phone,
      fax,
    } = request.all();

    const provider = await Provider.find(id);

    if (companyName != "" && companyName != undefined) {
      provider.companyName = companyName;
    }
    if (contactName != "" && contactName != undefined) {
      provider.contactName = contactName;
    }
    if (address != "" && address != undefined) {
      provider.address = address;
    }
    if (city != "" && city != undefined) {
      provider.city = city;
    }
    if (country != "" && country != undefined) {
      provider.country = country;
    }
    if (phone != "" && phone != undefined) {
      provider.phone = phone;
    }
    if (fax != "" && fax != undefined) {
      provider.fax = fax;
    }

    await provider.save().then(function () {
      console.log("A provider has been updated");
    });
    return response.redirect("/provider/list");
  }

  async delete({ response, params }) {
    const { id } = params;
    const provider = await Provider.find(id);
    await provider
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
}

module.exports = ProviderController;
