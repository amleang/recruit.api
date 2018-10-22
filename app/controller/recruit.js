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
    async list() {
        const ctx = this.ctx;
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
}

module.exports = RecruitController;
