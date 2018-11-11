'use strict';
const tip = require("../lib/tip")
const {
    cookiesValid,
    whereObject,
    sqlWhereCount,
    sqlWhere
} = require("../lib/utils")
const Controller = require('egg').Controller;

class BankController extends Controller {
    async insert() {
        debugger
        const ctx = this.ctx;
        const form = ctx.request.body;
        form.createAt = this.app.mysql.literals.now;
        delete form.id
        const result = await this.app.mysql.insert("wxbank", form);

        if (result.affectedRows > 0) {
            ctx.body = {
                ...tip[200],
                id: result.insertId
            };
        } else {
            ctx.body = {
                ...tip[2002]
            };
        }
    }
    async update() {
        const ctx = this.ctx;
        const form = ctx.request.body;
        form.updateAt = this.app.mysql.literals.now;
        delete form.createAt;
        const result = await this.app.mysql.update("wxbank", form);
        if (result.affectedRows > 0) {
            ctx.body = {
                ...tip[200]
            };
        } else {
            ctx.body = {
                ...tip[2003]
            };
        }
    }
    async item() {
        debugger
        const ctx = this.ctx;
        const id = ctx.params.id;
        const form = await this.app.mysql.get("wxbank", {
            unionid: id
        });

        this.ctx.body = {
            ...tip[200],
            data: form
        };
    }
}

module.exports = BankController;
