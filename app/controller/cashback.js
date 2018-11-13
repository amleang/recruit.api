'use strict';
const Controller = require('egg').Controller;
const tip = require("../lib/tip")
const {
    cookiesValid,
    whereObject,
    sqlWhereCount,
    sqlWhere,
} = require("../lib/utils")

class CashbackController extends Controller {
    async list() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const params = ctx.query;
        params.page = params.page || 1;
        params.size = params.size || 10;
        let offset = (params.page - 1) * params.size;

        const where = whereObject(params);
        const countWhere = sqlWhereCount("v_cashback", where);
        const count = await this.app.mysql.query(countWhere);
        const sql = sqlWhere("v_cashback", where, [['createAt', 'desc']], [offset, params.size,]);
        const results = await this.app.mysql.query(sql);
        ctx.body = {
            ...tip[200],
            data: results,
            count: count[0].count
        };
    }

    async inset() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;
        form.createAt = this.app.mysql.literals.now;
        delete form.id
        const result = await this.app.mysql.insert("cashback", form);
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

    async del() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.params.id;
        const form = await this.app.mysql.delete('cashback', {
            id: id
        });
        if (result.affectedRows > 0) {
            ctx.body = {
                ...tip[200]
            };
        } else {
            ctx.body = {
                ...tip[2004]
            };
        }
    }
}

module.exports = CashbackController;
