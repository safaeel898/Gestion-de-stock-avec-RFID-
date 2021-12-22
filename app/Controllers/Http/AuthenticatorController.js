"use strict";

class AuthenticatorController {
  async login({ view }) {
    return view.render("auth.login");
  }
}

module.exports = AuthenticatorController;
