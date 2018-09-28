'use strict';
const tip = require("../lib/tip")
const {
    cookiesValid,
    whereObject,
    sqlWhereCount
} = require("../lib/utils")
const Controller = require('egg').Controller;

class CompanyController extends Controller {
    async list() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
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

    async insert() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;

        await this.app.mysql.delete("links");
        var links = Object.assign({}, form.links);
        delete form.links;
        const result = await this.app.mysql.insert("company", form);
        if (result.affectedRows > 0) {
            for (var i = 0; i < links.length; i++) {
                await this.app.mysql.insert("links", links[i]);
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

    async update() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;

        await this.app.mysql.delete("links");
        var links = Object.assign({}, form.links);
        delete form.links;

        const result = await this.app.mysql.update("company", form);
        if (result.affectedRows > 0) {
            for (var i = 0; i < links.length; i++) {
                await this.app.mysql.insert("links", links[i]);
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

module.exports = CompanyController;