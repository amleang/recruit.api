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
    /**待回访列表 */
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
    /**待回访详情 */
    async wvisititem() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.params.id;
        const form = await this.app.mysql.get("v_enroll", {
            id: id
        });
        const results = await this.app.mysql.query("select * from v_enroll where unionid=? and id!=? and `status`=0  ORDER BY createAt desc ", [form.unionid, id]);
        form.otherdata = results;
        ctx.body = {
            ...tip[200],
            data: form
        };
    }
    /**
     * 作废
     */
    async invalid() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.params.id;
        const result = await this.app.mysql.update('enroll', { status: 5, updateAt: this.app.mysql.literals.now }, { where: { id: id } });
        if (result.affectedRows > 0) {
            ctx.body = {
                ...tip[200]
            };
        } else {
            ctx.body = {
                code: 1001,
                msg: "作废失败"
            };
        }
    }
    /**
     * 设置回访
     */
    async setvisit() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;
        form.updateAt = this.app.mysql.literals.now;
        delete form.createAt;

        const result = await this.app.mysql.update("enroll", form);
        if (result.affectedRows > 0) {
            this.app.mysql.query(" update enroll set `status`=5,updateAt=now()  where unionid=? and id!=? and status=0", [form.unionid, form.id]);
            ctx.body = {
                ...tip[200]
            };
        } else {
            ctx.body = {
                code: 1001,
                msg: "回访设置失败"
            };
        }
    }
    /**
     * 获取列表信息
     */
    async enrolllist() {
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
        const sql = sqlWhere("v_enroll", where, [['updateAt', 'desc']], [offset, params.size,]);
        const results = await this.app.mysql.query(sql);
        ctx.body = {
            ...tip[200],
            data: results,
            count: count[0].count
        };
    }
    /**
     * 设置报名装改
     */
    async setenroll() {
        debugger;
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;
        form.updateAt = this.app.mysql.literals.now;
        delete form.createAt;
        const result = await this.app.mysql.update("enroll", form);
        if (result.affectedRows > 0) {
            ctx.body = {
                ...tip[200]
            };
        } else {
            ctx.body = {
                code: 1001,
                msg: ""
            };
        }
    }
    /**
     * 获取待返现详情
     */
    async wcashbackitem(){
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.params.id;
        const form = await this.app.mysql.get("v_enroll", {
            id: id
        });
        const results = await this.app.mysql.query("select * from v_enroll where unionid=? and id!=? and `status`=0  ORDER BY createAt desc ", [form.unionid, id]);
        form.otherdata = results;
        ctx.body = {
            ...tip[200],
            data: form
        };
    }

}

module.exports = CrmController;
