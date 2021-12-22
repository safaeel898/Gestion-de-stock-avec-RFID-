"use strict";
const User = use("App/Models/User");
const Hash = use("Hash");

class UserController {
  async login({ request, response, auth }) {
    const { username, password } = request.all();

    try {
      await auth.attempt(username, password);
      return response.redirect("/");
    } catch (error) {
      console.log(error);
    }

    //    console.log(request.only(['username','password']));
    //    const user = await User.create(request.only(['username','password']))
    //    await auth.login(user);
    return response.redirect("/");
  }

  async register({ request, response, auth, session }) {
    const user = await User.create(
      request.only([
        "username",
        "firstname",
        "familyname",
        "phonenumber",
        "email",
        "password",
      ])
    );
    await auth.login(user);
    return response.redirect("/");
  }
}

module.exports = UserController;
