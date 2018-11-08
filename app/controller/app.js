'use strict';
const tip = require("../lib/tip")
const {
  whereObject,
  sqlWhereCount,
  sqlWhere
} = require("../lib/utils")
const Controller = require('egg').Controller;

class AppController extends Controller {
  /**
   * 获取首页recruit列表
   */
  async recruit() {
    const ctx = this.ctx;
    const params = ctx.query;
    params.page = params.page || 1;
    params.size = params.size || 10;
    let offset = (params.page - 1) * params.size;
    const where = whereObject(params);
    const countWhere = sqlWhereCount("recruit", where);
    const count = await this.app.mysql.query(countWhere);
    const sql = sqlWhere("recruit", where, [['active', 'desc'], ["isTop", "desc"]], [offset, params.size]);
    const results = await this.app.mysql.query(sql);
    ctx.body = {
      ...tip[200],
      data: results,
      count: count[0].count
    };
  }
  /**
   * 推荐recruit列表 6条
   */
  async recommend() {
    const ctx = this.ctx;
    const params = ctx.query;
    params.page = 1;
    params.size = 6;
    let offset = (params.page - 1) * params.size;
    const where = whereObject(params);
    const countWhere = sqlWhereCount("recruit", where);
    const count = await this.app.mysql.query(countWhere);
    const sql = sqlWhere("recruit", where, [['active', 'desc'], ["isTop", "desc"]], [offset, params.size]);
    const results = await this.app.mysql.query(sql);
    ctx.body = {
      ...tip[200],
      data: results,
      count: count[0].count
    };
  }
  /**
     * 获取 recruit 单条信息
     */
  async recruititem() {
    const ctx = this.ctx;
    const id = ctx.query.id;
    const form = await this.app.mysql.get("recruit", {
      id: id
    });
    const result = await this.app.mysql.select("subsidy",
      {
        where: { recruitId: id },
        orders: [['sort', 'asc']],
        limit: 100000, // 返回数据量
        offset: 0, // 数据偏移量
      }
    );
    form.imgs = form.imgs.split(',');
    form.subsidys = [];
    //获取补贴
    for (var i = 0; i < result.length; i++) {
      form.subsidys.push({ value: result[i].describe });
    }
    this.ctx.body = {
      ...tip[200],
      data: form
    };
  }
  /**
   * 纠错信息
   */
  async correction() {
    debugger
    const ctx = this.ctx;
    const form = ctx.request.body;
    if (form.imgs.length > 0)
      form.imgs = form.imgs.join(',');
    else
      form.imgs = "";
    form.createAt = this.app.mysql.literals.now;
    const result = await this.app.mysql.insert("correction", form);
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

  async co() {
    const ctx = this.ctx;
    const results = await this.app.mysql.select("company");
    if (results.length > 0) {
      const links = await this.app.mysql.select("links");
      results[0].links = links;
    }
    ctx.body = {
      ...tip[200],
      data: results
    };
  }
}

module.exports = AppController;
