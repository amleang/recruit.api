'use strict';
const tip = require("../lib/tip")
const {
    cookiesValid,
    whereObject,
    sqlWhereCount,
    sqlWhere
} = require("../lib/utils")
const Controller = require('egg').Controller;

class RecruitController extends Controller {
    /**
     * 后台列表
     */
    async list() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const params = ctx.query;
        params.page = params.page || 1;
        params.size = params.size || 10;
        let offset = (params.page - 1) * params.size;
        const where = whereObject(params);
        const countWhere = sqlWhereCount("recruit", where);
        const count = await this.app.mysql.query(countWhere);
        const sql = sqlWhere("recruit", where, [['createAt', 'desc']], [offset, params.size,]);
        const results = await this.app.mysql.query(sql);
        ctx.body = {
            ...tip[200],
            data: results,
            count: count[0].count
        };
    }
    /**
     * 获取单条
     */
    async item() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.params.id;
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
        for (var i = 0; i < result.length; i++) {
            form.subsidys.push({ value: result[i].describe });
        }
        this.ctx.body = {
            ...tip[200],
            data: form
        };
    }
    /**
     * 插入
     */
    async inset() {
        debugger;
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;
        form.active = 0;
        let imgs = JSON.parse(JSON.stringify(form.imgs))
        form.cover = imgs[0];
        form.imgs = imgs.join(',');
        let subsidys = JSON.parse(JSON.stringify(form.subsidys))
        delete form.subsidys;
        //用户名是否存在
        const countWhere = sqlWhereCount("recruit", { name: form.name });
        const namecount = await this.app.mysql.query(countWhere);
        if (namecount[0].count > 0) {
            ctx.body = { ...tip[1002] };
            return
        }
        form.createAt = this.app.mysql.literals.now;
        delete form.id
        const result = await this.app.mysql.insert("recruit", form);

        if (result.affectedRows > 0) {
            let id = result.insertId;
            for (var i = 0; i < subsidys.length; i++) {
                await this.app.mysql.insert("subsidy", { recruitId: id, sort: i, describe: subsidys[i].value });
            }
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
     * 修改
     */
    async update() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;

        const form = ctx.request.body;
        let imgs = JSON.parse(JSON.stringify(form.imgs))
        form.cover = imgs[0];
        form.imgs = imgs.join(',');
        let subsidys = JSON.parse(JSON.stringify(form.subsidys))
        delete form.subsidys;
        form.updateAt = this.app.mysql.literals.now;
        delete form.createAt;
        await this.app.mysql.delete("subsidy", { recruitId: form.id });
        const result = await this.app.mysql.update("recruit", form);
        if (result.affectedRows > 0) {

            for (var i = 0; i < subsidys.length; i++) {
                await this.app.mysql.insert("subsidy", { recruitId: form.id, sort: i, describe: subsidys[i].value });
            }
            ctx.body = {
                ...tip[200]
            };
        } else {
            ctx.body = {
                ...tip[2003]
            };
        }
    }
    /**
     * 修改活动状态
     */
    async active() {
        debugger;
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.query.id;
        const active = ctx.query.active;
        const result = await this.app.mysql.query("update recruit set active=? where id=?", [active, id]);
        if (result.affectedRows > 0) {
            ctx.body = {
                ...tip[200]
            };
        }
        else {
            ctx.body = {
                ...tip[2003]
            };
        }
    }
    /**
     * 状态
     */
    async status(){
        debugger;
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.query.id;
        const status = ctx.query.status;
        const result = await this.app.mysql.query("update recruit set status=? where id=?", [status, id]);
        if (result.affectedRows > 0) {
            ctx.body = {
                ...tip[200]
            };
        }
        else {
            ctx.body = {
                ...tip[2003]
            };
        }
    }
    /**招工纠错列表 */
    async correction() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const params = ctx.query;
        params.page = params.page || 1;
        params.size = params.size || 10;
        let offset = (params.page - 1) * params.size;
        const where = whereObject(params);
        const countWhere = sqlWhereCount("v_correction", where);
        const count = await this.app.mysql.query(countWhere);
        const sql = sqlWhere("v_correction", where, [['createAt', 'desc']], [offset, params.size,]);
        const results = await this.app.mysql.query(sql);
        ctx.body = {
            ...tip[200],
            data: results,
            count: count[0].count
        };
    }

    async correctionitem() {
        debugger
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const id = ctx.params.id;
        const form = await this.app.mysql.get("correction", {
            id: id
        });
        if (form.imgs != "")
            form.imgs = form.imgs.split(',');
        form.subsidys = [];
        this.ctx.body = {
            ...tip[200],
            data: form
        };
    }
}

module.exports = RecruitController;
