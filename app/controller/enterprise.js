'use strict';
const Controller = require('egg').Controller;
const tip = require("../lib/tip")
const {
    cookiesValid,
    whereObject,
    sqlWhereCount
} = require("../lib/utils")
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
    async list() {
        const ctx = this.ctx;
        const params = ctx.query;
        params.page = params.page || 1;
        params.size = params.size || 10;
        let offset = (params.page - 1) * params.size;
        const where = whereObject(params);
        const countWhere = sqlWhereCount("enterprise", where);
        const results = await this.app.mysql.select("enterprise", {
            where: where,
            orders: [
                ['createAt', 'asc']
            ],
            limit: params.size,
            offset: offset
        });
        const count = await this.app.mysql.query(countWhere);
        ctx.body = { ...tip[200],
            data: results,
            count: count[0].count
        };
    }
    async item() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.params.id;
        const form = await this.app.mysql.get("enterprise", {
            id: id
        });
        this.ctx.body = {
            ...tip[200],
            data: form
        };
    }

    async insert() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;
        form.createAt = this.app.mysql.literals.now;
        delete form.id
        const result = await this.app.mysql.insert("enterprise", form);
        if (result.affectedRows > 0) {
            ctx.body = {
                ...tip[200]
            };
        } else {
            ctx.body = {
                ...tip[2002]
            };
        }
    }
    async update() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;
        form.updateAt = this.app.mysql.literals.now;
        const result = await this.app.mysql.update("enterprise", form);
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
}

module.exports = EnterpriseController;