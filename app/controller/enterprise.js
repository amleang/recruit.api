'use strict';
const tip = require("../lib/tip")
const Controller = require('egg').Controller;
const {
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
    async list(){
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
}

module.exports = EnterpriseController;