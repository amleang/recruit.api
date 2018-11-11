'use strict';
const Controller = require('egg').Controller;
const tip = require("../lib/tip")
const {
    cookiesValid,
    whereObject,
    sqlWhereCount,
    sqlWhere,
} = require("../lib/utils")

class CrmController extends Controller {
  async wvisit() {
    const ctx = this.ctx;
    if (!cookiesValid(ctx))
        return;
    const params = ctx.query;
    params.page = params.page || 1;
    params.size = params.size || 10;
    let offset = (params.page - 1) * params.size;

    const where = whereObject(params);
    const countWhere = sqlWhereCount("v_enroll", where);
    const count = await this.app.mysql.query(countWhere);
    const sql = sqlWhere("v_enroll", where, [['createAt', 'desc']], [offset, params.size,]);
    const results = await this.app.mysql.query(sql);
    ctx.body = {
        ...tip[200],
        data: results,
        count: count[0].count
    };
  }

  async wvisititem(){
      
  }
}

module.exports = CrmController;
