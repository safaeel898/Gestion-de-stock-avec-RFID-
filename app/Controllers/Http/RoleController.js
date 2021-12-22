"use strict";

const Database = use("Database");
const Role = use("App/Models/Role");
const RolePer = use("App/Models/RolePermission");
const UserRole = use("App/Models/UserRole");
class RoleController {
  async index({ response, request, view, params }) {
    const page = params.page ? params.page : 1;

    //const role = await Database.from("roles").paginate(page, 10)
    const roles = await Database.select(
      "roles.id",
      "roles.title",
      Database.raw("GROUP_CONCAT(permissions.name) as permissions")
    )
      .from("roles")
      .innerJoin("role_permissions", "roles.id", "role_permissions.role_id")
      .innerJoin(
        "permissions",
        "role_permissions.permission_id",
        "permissions.id"
      )
      .groupBy("roles.id");
    return view.render("dashboard.role.index", { roles: roles });
  }

  async create({ response, request, view, params }) {
    const permissions = await Database.from("permissions");
    return view.render("dashboard.role.create", { permissions: permissions });
  }

  async delete({ response, request, view, params }) {
    const { id } = params;
    const role = await Role.find(id);
    await role
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }
  async store({ request, response }) {
    const { title, per } = request.all();

    const role = new Role();
    role.title = title;
    await role.save().then(function () {
      console.log("a role has been add");
    });
    for (var i = 0; i < per.length; i++) {
      const rp = new RolePer();
      rp.role_id = role.id;
      rp.permission_id = per[i];
      await rp.save().then(function () {
        console.log("a role_permission has been add");
      });
    }

    return response.redirect("/role/list");
  }

  async edit({ view, params }) {
    const { id } = params;
    const permissions = await Database.from("permissions");
    const roles = await Database.select(
      "roles.title",
      "role_permissions.permission_id"
    )
      .from("roles")
      .innerJoin("role_permissions", "roles.id", "role_permissions.role_id")
      .where("roles.id", id);
    var result = {
      permissions: permissions,
      id: id,
      title: roles[0].title,
      role_permissions: roles.map((element) => element.permission_id),
    };

    return view.render("dashboard.role.update", result);
  }
  // Store user POST
  async update({ request, response }) {
    const { id, title, perrole, per } = request.all();

    var role_permission = perrole.split(",");
    console.log(role_permission);
    console.log(per);
    Array.prototype.diff = function (arr2) {
      return this.filter((x) => !arr2.includes(x));
    };
    var toAdd = per.diff(role_permission);
    var toDel = role_permission.diff(per);
    console.log(toAdd);
    console.log(toDel);
    for (var j = 0; j < toAdd.length; j++) {
      const rp = new RolePer();
      rp.role_id = id;
      rp.permission_id = toAdd[j];
      await rp.save().then(function () {
        console.log("a role_permission has been add");
      });
    }

    for (var i = 0; i < toDel.length; i++) {
      await RolePer.query()
        .where("role_id", id)
        .andWhere("permission_id", toDel[i])
        .delete();
    }
    const role = await Role.find(id);
    if (title != "" && title != undefined) {
      role.title = title;
    }

    await role.save().then(function () {
      console.log("a role has been updated");
    });
    return response.redirect("/role/list");
  }
}

module.exports = RoleController;
