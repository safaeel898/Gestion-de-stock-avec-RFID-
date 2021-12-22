"use strict";
const Database = use("Database");
class DashboardController {
  async index({ auth, view }) {
    const user = await auth.getUser();
    const progress = await Database.select("duties.*")
      .from("duties")
      .leftJoin("users", "users.id", "duties.user_id")
      .where({ user_id: user.id, complete: 0 })
      .orderBy("duties.duty_date", "desc")
      .limit(3);

    const completed = await Database.select("duties.*")
      .from("duties")
      .leftJoin("users", "users.id", "duties.user_id")
      .where({ user_id: user.id, complete: 1 })
      .orderBy("duties.duty_date", "desc")
      .limit(3);
    return view.render("dashboard.index", {
      progress: progress,
      completed: completed,
    });
  }
}

module.exports = DashboardController;
