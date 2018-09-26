'use strict';
const tip = require("../lib/tip")
const Controller = require('egg').Controller;

class EnterpriseController extends Controller {
    async select() {
        const ctx = this.ctx;
        const results = await this.app.mysql.select("enterprise", {
            columns: ["id", "name"]
        })
        ctx.body = { ...tip[200],
            data: results
        };
    }
}

module.exports = EnterpriseController;