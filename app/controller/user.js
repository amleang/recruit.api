'use strict';
const Controller = require('egg').Controller;
const svgCaptcha = require('svg-captcha');
const md5 = require('md5');
const tip = require("../lib/tip")
const {
    cookiesValid,
    whereObject,
    sqlWhereCount,
    sqlWhere,
} = require("../lib/utils")
class UserController extends Controller {
    /**
     * 用户登录
     */
    async login() {
        const query = this.ctx.query;
        if (this.ctx.session.capthcha.toLocaleLowerCase() == query.captcha.toLocaleLowerCase()) {
            const results = await this.app.mysql.select('user', {
                where: {
                    username: query.username,
                    userpwd: md5(query.pwd)
                },
                columns: ['id', 'username', 'active'],
            });
            if (results.length > 0) {
                if (results[0].active != 1) {
                    this.ctx.body = {
                        ...tip[1002]
                    }
                } else {
                    this.ctx.cookies.set("recrit-ck", JSON.stringify(results[0]), {
                        maxAge: 4 * 1000 * 60 * 60,
                        httpOnly: false // 默认就是 true
                    })
                    this.ctx.body = {
                        ...tip[200],
                        docs: results[0]
                    }
                }
            } else {
                this.ctx.body = {
                    ...tip[1001]
                }
            }
        } else {
            this.ctx.body = {
                ...tip[1006]
            }
        }
    }
    /**
     * 验证码
     */
    async captcha() {
        let captcha = await svgCaptcha.create();

        this.ctx.session.capthcha = captcha.text;
        this.ctx.type = 'svg';
        this.ctx.body = captcha.data;
    }
    /**
     * 获取列表
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
        const countWhere = sqlWhereCount("user", where);
 /*        const results = await this.app.mysql.select("user", {
            where: where,
            orders: [
                ['role', 'asc'],
                ['createAt', 'desc']
            ],
            limit: params.size,
            offset: offset
        }); */
        const count = await this.app.mysql.query(countWhere);
        const sql = sqlWhere("user", where, [['role', 'asc'], ['createAt', 'desc']], [offset, params.size,]);
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
        const form = await this.app.mysql.get("user", {
            id: id
        });
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
        //用户名是否存在
        const countWhere = sqlWhereCount("user", { username: form.username });
        const namecount = await this.app.mysql.query(countWhere);
        if (namecount[0].count > 0) {
            ctx.body = { ...tip[1002] };
            return
        }
        form.createAt = this.app.mysql.literals.now;
        if (form.role == 1)
            form.userpwd = md5("123");
        else {
            form.invitationCode = await this.invitationCodeFun();
        }
        delete form.id
        const result = await this.app.mysql.insert("user", form);
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
     * 修改
     */
    async update() {
        const ctx = this.ctx;
        if (!cookiesValid(ctx))
            return;
        const form = ctx.request.body;
        if (form.role == 1 && form.userpwd == "") {
            form.userpwd = md5("123");
        }
        form.updateAt = this.app.mysql.literals.now;
        delete form.createAt;
        const result = await this.app.mysql.update("user", form);
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
    /**
     * 获取邀请码
     */
    async invitationCodeFun() {
        let code = await this.RndNum(5);
        const countWhere = sqlWhereCount("user", { role: 2, invitationCode: code });
        const count = await this.app.mysql.query(countWhere);
        if (count[0].count > 0)
            await this.invitationCodeFun();
        return code;

    }
    /**
     * 生成随机数
     * @param {位数} n 
     */
    async RndNum(n) {
        var rnd = "";
        for (var i = 0; i < n; i++)
            rnd += Math.floor(Math.random() * 10);
        return rnd;
    }
}
module.exports = UserController;