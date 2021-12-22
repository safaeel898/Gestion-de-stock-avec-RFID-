"use strict";

const Database = use("Database");
const Permission = use("App/Models/Permission");
class PermissionController {
  async index({ response, request, view, params }) {
    const page = params.page ? params.page : 1;
    const permissions = await Database.from("permissions").paginate(page, 10);

    return view.render("dashboard.permission.index", {
      permissions: permissions,
      page: page,
    });
  }
  async create({ response, request, view, params }) {
    return view.render("dashboard.permission.create");
  }

  async delete({ response, request, view, params }) {
    const { id } = params;

    const permission = await Permission.find(id);
    await permission
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }

  async store({ request, response }) {
    const { name } = request.all();
    const permission = new Permission();
    permission.name = name;
    await permission.save().then(function () {
      console.log("a permission has been add");
    });
    return response.redirect("/permission/list");
  }

  async edit({ view, params }) {
    const { id } = params;
    const permission = await Permission.find(id);
    return view.render("dashboard.permission.update", {
      permission: permission,
      id: id,
    });
  }
  // Store user POST
  async update({ request, response }) {
    const { id, name } = request.all();
    const permission = await Permission.find(id);
    if (name != "" && name != undefined) {
      permission.name = name;
    }

    await permission.save().then(function () {
      console.log("a permission has been updated");
    });
    return response.redirect("/permission/list");
  }
}

module.exports = PermissionController;
