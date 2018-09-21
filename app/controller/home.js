'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    debugger
    const results = await this.app.mysql.select('user', {
      where: {
        username: 'admin'
      }
    });
    this.ctx.body = results;
  }
}

module.exports = HomeController;