"use strict";

const Database = use("Database");
const User = use("App/Models/User");
const UserRole = use("App/Models/UserRole");
const Hash = use("Hash");
class StaffController {
  async index({ response, request, view, params }) {
    const page = params.page ? params.page : 1;
    const users = await Database.select(
      "users.*",
      Database.raw("GROUP_CONCAT(roles.title) as roles")
    )
      .from("users")
      .leftJoin("user_roles", "users.id", "user_roles.user_id")
      .leftJoin("roles", "user_roles.role_id", "roles.id")
      .groupBy("users.id")
      .paginate(page, 10);
    return view.render("dashboard.staff.index", {
      users: users,
      page: page,
    });
  }

  async delete({ response, request, view, params }) {
    const { id } = params;

    const user = await User.find(id);
    await user
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }

  async create({ response, request, view, params }) {
    return view.render("dashboard.staff.create");
  }

  async store_roles({ request, response }) {
    const { id, role } = request.all();
    for (var i = 0; i < role.length; i++) {
      const userrole = new UserRole();
      userrole.role_id = role[i];
      userrole.user_id = id;
      await userrole.save().then(function () {
        console.log("a role_permission has been add");
      });
    }
    return response.redirect("/staff/list");
  }

  async add_roles({ request, view, params }) {
    const id = params.id;
    const role = await Database.from("roles");
    return view.render("dashboard.staff.role", { roles: role, id: id });
  }

  async edit({ auth, view, params }) {
    const user = await auth.getUser();
    user.password = "";
    return view.render("dashboard.staff.update", { user: user });
  }
  async update({ request, response, view }) {
    const {
      id,
      useremail,
      username,
      firstname,
      familyname,
      phone,
      userpassword,
      newpassword,
      newpassword2,
    } = request.all();
    const user = await User.find(id);
    const isSame = await Hash.verify(userpassword, user.password);
    if (useremail != "" && useremail != undefined) {
      user.email = useremail;
    }
    if (username != "" && username != undefined) {
      user.username = username;
    }
    if (firstname != "" && firstname != undefined) {
      user.firstname = firstname;
    }
    if (familyname != "" && familyname != undefined) {
      user.familyname = familyname;
    }
    if (phone != "" && phone != undefined) {
      user.phonenumber = phone;
    }
    if (isSame) {
      if (newpassword == newpassword2) {
        user.password = newpassword;
        await user.save().then(function () {
          console.log("A staff has been updated");
        });
        return response.redirect("/");
      } else {
        return view.render("dashboard.staff.update", { user: user, error: 1 });
      }
    } else {
      return view.render("dashboard.staff.update", { user: user, error: 2 });
    }
  }
}

module.exports = StaffController;
