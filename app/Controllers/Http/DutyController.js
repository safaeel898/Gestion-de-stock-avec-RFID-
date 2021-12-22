"use strict";
const Database = use("Database");
const Duty = use("App/Models/Duty");

class DutyController {
  async index({ view, params }) {
    const page = params.page ? params.page : 1;
    const duties = await Database.select(
      "duties.*",
      "users.firstname",
      "users.familyname"
    )
      .from("duties")
      .leftJoin("users", "users.id", "duties.user_id")
      .paginate(page, 10);

    for (var i = 0; i < duties.data.length; i++) {
      duties.data[i].due_date = dateMaker(duties.data[i].due_date);
      duties.data[i].duty_date = dateMaker(duties.data[i].duty_date);
    }
    return view.render("dashboard.duty.index", {
      duties: duties,
      page: page,
    });
  }
  async create({ view, params }) {
    const users = await Database.select(
      "users.*",
      Database.raw("GROUP_CONCAT(roles.title) as roles")
    )
      .from("users")
      .leftJoin("user_roles", "users.id", "user_roles.user_id")
      .leftJoin("roles", "user_roles.role_id", "roles.id")
      .groupBy("users.id");
    return view.render("dashboard.duty.create", { users: users });
  }
  async store({ request, response }) {
    const {
      subject,
      due_date,
      duty_date,
      user,
      duty_description,
    } = request.all();
    const duty = new Duty();
    duty.title = subject;
    duty.due_date = due_date;
    duty.duty_date = duty_date;
    duty.user_id = user;
    duty.duty_description = duty_description;
    duty.complete = false;

    await duty.save().then(function () {
      console.log("a duty has been add");
    });

    return response.redirect("/duty/list");
  }

  async edit({ response, request, view, params }) {
    const { id } = params;
    console.log(id);
    const duty = await Duty.find(id);

    duty.due_date = dateInputMaker(duty.due_date);
    duty.duty_date = dateInputMaker(duty.duty_date);

    const users = await Database.select(
      "users.*",
      Database.raw("GROUP_CONCAT(roles.title) as roles")
    )
      .from("users")
      .leftJoin("user_roles", "users.id", "user_roles.user_id")
      .leftJoin("roles", "user_roles.role_id", "roles.id")
      .groupBy("users.id");

    return view.render("dashboard.duty.update", {
      users: users,
      duty: duty,
      id: id,
    });
  }

  async update({ request, response }) {
    const {
      id,
      user,
      subject,
      due_date,
      duty_date,
      duty_description,
    } = request.all();

    const duty = await Duty.find(id);

    if (user != "" && user != undefined) {
      duty.user_id = user;
    }

    if (subject != "" && subject != undefined) {
      duty.title = subject;
    }

    if (due_date != "" && due_date != undefined) {
      duty.due_date = due_date;
    }

    if (duty_date != "" && duty_date != undefined) {
      duty.duty_date = duty_date;
    }

    if (duty_description != "" && duty_description != undefined) {
      duty.duty_description = duty_description;
    }

    await duty.save().then(function () {
      console.log("A duty has been updated");
    });

    return response.redirect("/duty/list");
  }

  async delete({ response, request, view, params }) {
    const { id } = params;
    const duty = await Duty.find(id);
    await duty
      .delete()
      .then((data) => {
        return response.status(200).send({ data: "yes" });
      })
      .catch((e) => {
        return response.status(500).json({ error: e });
      });
  }

  async complete({ response, request, view, params }) {
    const { id } = params;
    const duty = await Duty.find(id);
    duty.complete = true;
    await duty
      .save()
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
  var day = date.getDate() + "";
  var month = date.getMonth() + 1 + "";
  if (month.length == 1) {
    month = "0" + month;
  }
  if (day.length == 1) {
    day = "0" + day;
  }
  var year = date.getFullYear();
  return year + "-" + month + "-" + day;
}
module.exports = DutyController;
