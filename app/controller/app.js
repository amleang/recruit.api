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
  async recommendlist() {
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
    const unionid = ctx.query.unionid;
    let att = 0;
    if (unionid) {
      /**是否关注 */
      const attresult = await this.app.mysql.query("select count(*) as count from attention where unionid=? and recruitid=?", [unionid, id]);
      if (attresult[0].count > 0)
        att = 1;
    }
    /**获取报名人数 */
    const enrollresult = await this.app.mysql.query(" SELECT COUNT(*) as count from(select unionid from enroll where recruitid=? GROUP BY unionid) as t ", [id]);
    form.signupCount = enrollresult[0].count;
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
    form.att = att;
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
  /**
   * 获取公司信息
   */
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
  /**
   * 免费报名
   */
  async enroll() {
    const ctx = this.ctx;
    const form = ctx.request.body;
    form.status = 0;
    let isFlag = true;
    if (form.inviterCode) {
      //判断是否存在
      const count = await this.app.mysql.query("select count(*) as count from user where invitationCode='" + form.inviterCode + "'");
      if (count.count == 0) {
        isFlag = false;
        ctx.body = {
          code: 101,
          msg: "您填写的邀请码不存在"
        }
      }
    }
    if (isFlag) {
      form.createAt = this.app.mysql.literals.now;
      const result = await this.app.mysql.insert("enroll", form);
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
  }

  /**
 * 关注
 */
  async attention() {
    debugger;
    const ctx = this.ctx;
    let form = ctx.request.body;
    const unionid = form.unionid;
    const recruitid = form.recruitid;
    const item = await this.app.mysql.get("attention", {
      unionid: unionid,
      recruitid: recruitid
    });

    if (item) {
      item.createAt = this.app.mysql.literals.now;
      const result = await this.app.mysql.update("attention", item);
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
    else {
      form.createAt = this.app.mysql.literals.now;
      const result = await this.app.mysql.insert("attention", form);

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
  }
  /**
   * 取消关注
   */
  async attentiondel() {
    const ctx = this.ctx;
    const form = ctx.request.body;
    const unionid = form.unionid;
    const recruitid = form.recruitid;
    const result = await this.app.mysql.delete('attention', {
      unionid: unionid,
      recruitid: recruitid
    });
    if (result.affectedRows > 0) {
      ctx.body = {
        ...tip[200]
      };
    } else {
      ctx.body = {
        code: "1001",
        msg: "取消关注失败"
      };
    }
  }
  /**
   * 关注列表
   */
  async attentionlist() {
    const ctx = this.ctx;
    const params = ctx.query;
    params.page = params.page || 1;
    params.size = params.size || 1000000;
    let offset = (params.page - 1) * params.size;
    const where = whereObject(params);
    const sql = sqlWhere("v_attention", where, [['createAt', 'desc']], [offset, params.size]);
    const results = await this.app.mysql.query(sql);
    ctx.body = {
      ...tip[200],
      data: results
    };
  }
  /**
   * 立即推荐
   */
  async recommend() {
    const ctx = this.ctx;
    let form = ctx.request.body;
    const unionid = form.unionid;
    const phone = form.phone;
    const item = await this.app.mysql.get("recommend", {
      unionid: unionid,
      phone: phone
    });
    if (item) {
      ctx.body = {
        code: 1001,
        msg
      };
      return;
    }
    else {
      form.createAt = this.app.mysql.literals.now;
      const result = await this.app.mysql.insert("recommend", form);

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

  }
  /**
   * 余额
   */
  async balance() {
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const result = await this.app.mysql.query("select SUM(price) as totalprice from v_cashbacklist where `status`=1 and unionid=?", [unionid]);
    const form = {
      totalprice: result[0].totalprice,
    }
    ctx.body = {
      ...tip[200],
      data: form
    };
  }
  /**
   * 查看余额明细
   */
  async balancelist() {
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const results = await this.app.mysql.query("select * from v_cashbacklist where `status`=1 and unionid=? order by updateAt asc", [unionid])

    ctx.body = {
      ...tip[200],
      data: results
    };
  }
  /**
   * 补贴记录
   */
  async cashbacklist() {
    const ctx = this.ctx;
    let unionid = ctx.query.unionid;
    const results = await this.app.mysql.query("select * from v_cashback where unionid=? order by createAt ASC", [unionid])

    ctx.body = {
      ...tip[200],
      data: results
    };
  }
  /**
   * 我的工作
   */
  async worklist(){
    debugger
    const ctx=this.ctx;
    let unionid=ctx.query.unionid;
    const results=await this.app.mysql.query("select * from v_work where unionid=? and `status` in(3,4) order by entryAt DESC",[unionid])
    ctx.body = {
      ...tip[200],
      data: results
    };
  }
}

module.exports = AppController;
